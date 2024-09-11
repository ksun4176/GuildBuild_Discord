import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface, GetCommandInfo } from "../../CommandInterface";
import { Prisma } from "@prisma/client";
import { UserRoleType } from "../../DatabaseHelper";

const options = {
    game: 'game'
}

const setupserverCommand: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('addgame')
        .setDescription('Add a game to the server')
        .addIntegerOption(option => 
            option.setName(options.game)
                .setDescription('game to add to server')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply('This command needs to be ran in a server');
            return;
        }
        await interaction.deferReply();
        const serverInfo = interaction.guild;

        const gameId = interaction.options.getInteger(options.game);
        try {
            const { prisma, caller, databaseHelper } = await GetCommandInfo(interaction.user);

            const server = await prisma.server.findUniqueOrThrow({ where: {discordId: serverInfo.id } });
            // check if server owner OR admin
            const roles: Prisma.UserRoleWhereInput[] = [
                { serverId: server.id, roleType: UserRoleType.ServerOwner },
                { serverId: server.id, roleType: UserRoleType.Administrator }
            ]
            const hasPermission = await databaseHelper.userHasPermission(caller.id, roles);
            if (!hasPermission) {
                interaction.editReply('Only the server owner and administrators have permission to run this command');
                return;
            }

            const gamePlaceholderGuild = await databaseHelper.createPlaceholderGuild(gameId!, server.id);

            let message = `Game '${gamePlaceholderGuild.game.name}' is added to the server '${server.name}'\n`;
            console.log(message);
            message += `You can now call /createguild to add guilds for this game.\n`
            await interaction.editReply(message);
        }
        catch (error) {
            console.error(error);
            await interaction.editReply('There was an issue adding the game to the server');
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const { prisma } = await GetCommandInfo(interaction.user);
        const games = await prisma.game.findMany();
		await interaction.respond(
			games.map(game => ({ name: game.name, value: game.id })),
		);
    },
}

export = setupserverCommand;