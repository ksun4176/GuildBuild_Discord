import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface, GetCommandInfo } from "../../CommandInterface";
import { Guild, GuildApplicant, Prisma, PrismaClient, Server, User, UserRole } from "@prisma/client";
import { DatabaseHelper, UserRoleType } from "../../DatabaseHelper";

const subcommands = {
    accept: 'accept',
    decline: 'decline'
}

const options = {
    game: 'game',
    guild: 'guild',
    user: 'user'
}

const appActionCommands: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('application')
        .setDescription('Actions you can take on an application')
        .addSubcommand(subcommand =>
            subcommand
                .setName(subcommands.accept)
                .setDescription('accept an application')
                .addIntegerOption(option =>
                    option.setName(options.game)
                        .setDescription('game application is for')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addIntegerOption(option =>
                    option.setName(options.guild)
                        .setDescription('guild to accept into')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addUserOption(option =>
                    option.setName(options.user)
                        .setDescription('user to accept')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName(subcommands.decline)
                .setDescription('decline an application')
                .addIntegerOption(option =>
                    option.setName(options.game)
                        .setDescription('game application is for')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addUserOption(option =>
                    option.setName(options.user)
                        .setDescription('user to decline')
                )
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply('This command needs to be ran in a server');
            return;
        }
        await interaction.deferReply();
        const serverInfo = interaction.guild;

        const subcommand = interaction.options.getSubcommand();
        const gameId = interaction.options.getInteger(options.game)!;
        const guildId = interaction.options.getInteger(options.guild);
        const userInfo = interaction.options.getUser(options.user);
        
        try {
            const { prisma, caller, databaseHelper } = await GetCommandInfo(interaction.user);
            const server = await prisma.server.findUniqueOrThrow({ where: { discordId: serverInfo.id } });
            const guild = await prisma.guild.findUniqueOrThrow({ where: { id: guildId! } });
            const user = await prisma.user.findUniqueOrThrow({ where: {discordId: userInfo!.id } });
            const application = await prisma.guildApplicant.findUnique({
                where: {
                    userId_gameId_serverId: {
                        userId: user.id,
                        gameId: gameId,
                        serverId: server.id
                    }
                }
            });

            let message = 'No action done';
            switch (subcommand) {
                case subcommands.accept:
                    message = await acceptAction(interaction, user, guild, prisma, caller, databaseHelper, application);
                    break;
                case subcommands.decline:
                    message = await declineAction(server, prisma, caller, databaseHelper, application);
                    break;
            }
            console.log(message);
            await interaction.editReply(message);
        }
        catch (error) {
            console.error(error);
            await interaction.editReply('There was an issue taking this action.');
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        if (!interaction.guild) {
            return;
        }
        const serverInfo = interaction.guild;
        const focusedOption = interaction.options.getFocused(true);
        
        try {
            const { prisma, databaseHelper } = await GetCommandInfo(interaction.user);
            const server = await prisma.server.findUniqueOrThrow({ where: {discordId: serverInfo.id } });
            
            switch (focusedOption.name) {
                case options.game:
                    const gameGuilds = await databaseHelper.getPlaceholderGuilds(server.id);
                    await interaction.respond(
                        gameGuilds.map(guild => ({ name: guild.game.name, value: guild.game.id }))
                    );
                    break;
                case options.guild:
                    const gameId = interaction.options.getInteger(options.game)!;
                    let criteria: Prisma.GuildWhereInput = {
                        server: server,
                        gameId: gameId,
                        active: true
                    }
                    databaseHelper.addPlaceholderCriteria(criteria, true);
                    const guilds = await prisma.guild.findMany({
                        where: criteria
                    });
                    await interaction.respond(
                        guilds.map(guild => ({ name: guild.name, value: guild.id }))
                    );
                    break;
            }
        }
        catch (error) {
            console.log(error);
        }
    },
}

/**
 * Accept a guild application.
 * This will also be used to transfer user between guilds.
 * @param interaction The discord interaction
 * @param user The user to accept
 * @param guild The guild to be accepted into
 * @param prisma Prisma Client
 * @param caller The user who called this interaction
 * @param databaseHelper database helper
 * @param application The guild application if there is one
 * @returns The response to display to user
 */
const acceptAction = async function(
    interaction: ChatInputCommandInteraction,
    user: User,
    guild: Guild,
    prisma: PrismaClient,
    caller: User,
    databaseHelper: DatabaseHelper,
    application: GuildApplicant | null
): Promise<string> {
    // check if server owner OR admin OR guild management
    let roles: Prisma.UserRoleWhereInput[] = [
        { serverId: guild.serverId, roleType: UserRoleType.ServerOwner },
        { serverId: guild.serverId, roleType: UserRoleType.Administrator },
        { serverId: guild.serverId, roleType: UserRoleType.GuildLead, guildId: guild.id },
        { serverId: guild.serverId, roleType: UserRoleType.GuildManagement, guildId: guild.id },
    ]
    let hasPermission = await databaseHelper.userHasPermission(caller.id, roles);
    if (!hasPermission) {
        return 'You do not have permission to run this command';
    }
    const guildRole = await databaseHelper.getGuildRole(guild, UserRoleType.GuildMember);
    const sharedGuildRole = await databaseHelper.getSharedGuildRole(guild, UserRoleType.GuildMember);
    // get current roles to figure out what roles need to be added
    const currentRelations = await prisma.userRelation.findMany({ 
        where: { 
            user: user,
            role: { serverId: guild.serverId }
        }
    });
    const rolesToAdd: UserRole[] = [];
    if (guildRole && currentRelations.findIndex(relation => relation.roleId === guildRole.id) < 0) {
        rolesToAdd.push(guildRole);
    }
    if (sharedGuildRole && currentRelations.findIndex(relation => relation.roleId === sharedGuildRole.id) < 0) {
        rolesToAdd.push(sharedGuildRole);
    }
    if (rolesToAdd.length > 0) {
        await prisma.userRelation.createMany( {
            data: rolesToAdd.map(role => { return { userId: user.id, roleId: role.id } })
        });
        if (user.discordId) {
            const discordUser = await interaction.guild!.members.fetch(user.discordId);
            discordUser.roles.add(rolesToAdd.filter(role => !!role.discordId).map(role => role.discordId!));
        }
    }
    if (application) {
        await prisma.guildApplicant.delete({
            where: { id: application.id },
        });
    }
    
    return `'${user.name}' was accepted into '${guild.name}'`;
}

/**
 * 
 * @param interaction The discord interaction
 * @param user The user to accept
 * @param guild The guild to be accepted into
 * @param prisma Prisma Client
 * @param caller The user who called this interaction
 * @param databaseHelper database helper
 * @param application The guild application if there is one
 * @returns The response to display to user
 */
const declineAction = async function(
    server: Server,
    prisma: PrismaClient,
    caller: User,
    databaseHelper: DatabaseHelper,
    application: GuildApplicant | null
): Promise<string> {
    // check if server owner OR admin
    const roles: Prisma.UserRoleWhereInput[] = [
        { serverId: server.id, roleType: UserRoleType.ServerOwner },
        { serverId: server.id, roleType: UserRoleType.Administrator },
    ]
    const hasPermission = await databaseHelper.userHasPermission(caller.id, roles);
    if (!hasPermission) {
        return 'You do not have permission to run this command';
    }
    if (!application) {
        return 'There is no open application';
    }
    await prisma.guildApplicant.delete({
        where: { id: application.id },
    });

    return 'Application was declined';
}
export = appActionCommands;

