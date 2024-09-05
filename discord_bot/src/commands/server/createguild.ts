import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface } from "../../CommandInterface";
import { PrismaClient } from "@prisma/client";
import { GuildModel } from "../../models/guildmodel";
import { ServerModel } from "../../models/servermodel";
import { RoleType, UserRoleModel } from "../../models/userrolemodel";

const strings = {
    commandName: 'createguild',
    commandDescription: 'Create (or update) a guild in the server',
    invalidGuild: 'There was an issue creating the guild',
    notInServer: 'This command needs to be ran in a server',
    options: {
        game: 'game',
        ingameid: 'ingameid',
        name: 'name',
        leadrole: 'leadrole',
        managementrole: 'managementrole',
        memberrole: 'memberrole'
    },
    optionsDescription: {
        game: 'game guild is in',
        ingameid: 'ID in game',
        name: 'name of guild',
        leadrole: 'role for guild lead',
        managementrole: 'role for guild management',
        memberrole: 'role for guild members'
    }
}

const setupserverCommand: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName(strings.commandName)
        .setDescription(strings.commandDescription)
        .addIntegerOption(option =>
            option.setName(strings.options.game)
                .setDescription(strings.optionsDescription.game)
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option.setName(strings.options.ingameid)
                .setDescription(strings.optionsDescription.ingameid)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName(strings.options.name)
            .setDescription(strings.optionsDescription.name)
            .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName(strings.options.leadrole)
            .setDescription(strings.optionsDescription.leadrole)
        )
        .addRoleOption(option =>
            option.setName(strings.options.managementrole)
            .setDescription(strings.optionsDescription.managementrole)
        )
        .addRoleOption(option =>
            option.setName(strings.options.memberrole)
            .setDescription(strings.optionsDescription.memberrole)
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply(strings.notInServer);
            return;
        }
        await interaction.deferReply();
        const serverInfo = interaction.guild;
        const gameId = interaction.options.getInteger(strings.options.game);
        const inGameId = interaction.options.getString(strings.options.ingameid);
        const name = interaction.options.getString(strings.options.name);
        const leadRoleInfo = interaction.options.getRole(strings.options.leadrole);
        const managementRoleInfo = interaction.options.getRole(strings.options.managementrole);
        const memberRoleInfo = interaction.options.getRole(strings.options.memberrole);
        try {
            const prisma = new PrismaClient();
            const serverModel = new ServerModel(prisma);
            const guildModel = new GuildModel(prisma);
            const userRoleModel = new UserRoleModel(prisma);
            const server = await serverModel.delegate.findUniqueOrThrow({ where: {discordId: serverInfo.id } });
            const guild = await guildModel.create(name!, server.id, gameId!, inGameId!);
            
            let message = `### Guild Added\n` +
                `- ID: ${guild.id}\n` +
                `- Name: ${guild.name}\n` +
                `- Game: ${guild.game.name}\n`;
            
            const roleMessages = [];
            if (leadRoleInfo) {
                const leadRole = await userRoleModel.create(`${name} Lead`, guild.serverId, guild.id, leadRoleInfo.id, RoleType.GuildLead);
                roleMessages.push(`<@&${leadRole.discordId}>`);
            }
            if (managementRoleInfo) {
            const managementRole = await userRoleModel.create(`${name} Management`, guild.serverId, guild.id, managementRoleInfo.id, RoleType.GuildManagement);
                roleMessages.push(`<@&${managementRole.discordId}>`);
            }
            if (memberRoleInfo) {
                const memberRole = await userRoleModel.create(`${name} Member`, guild.serverId, guild.id, memberRoleInfo.id, RoleType.GuildMember);
                roleMessages.push(`<@&${memberRole.discordId}>`);
            }
            if (roleMessages.length > 0) {
                message += `- Roles Added: ${roleMessages.join(' ')}\n`;
            }

            console.log(message);
            await interaction.editReply(message);
        }
        catch (error) {
            console.error(error);
            await interaction.editReply(strings.invalidGuild);
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        if (!interaction.guild) {
            return;
        }
        const serverInfo = interaction.guild;
        
        const prisma = new PrismaClient();
        const serverModel = new ServerModel(prisma);
        const server = await serverModel.delegate.findUniqueOrThrow({ where: {discordId: serverInfo.id } });
        const guildModel = new GuildModel(prisma);
        const gameGuilds = await guildModel.getPlaceholderGuilds(server.id);
		await interaction.respond(
			gameGuilds.map(guild => ({ name: guild.game.name, value: guild.game.id })),
		);
    },
}

export = setupserverCommand;