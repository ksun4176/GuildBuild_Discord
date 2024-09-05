import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface } from "../../CommandInterface";
import { PrismaClient } from "@prisma/client";
import { GameModel } from "../../models/gamemodel";
import { GuildModel } from "../../models/guildmodel";
import { ServerModel } from "../../models/servermodel";

const strings = {
    commandName: 'addgame',
    commandDescription: 'Add a game to the server',
    invalidGame: 'There was an issue adding the game to the server',
    missingGame: 'Missing game ID',
    notInServer: 'This command needs to be ran in a server',
    options: {
        game: 'game',
    },
    optionsDescription: {
        game: 'game to add to server',
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
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply(strings.notInServer);
            return;
        }
        await interaction.deferReply();
        const serverInfo = interaction.guild;
        const gameId = interaction.options.getInteger(strings.options.game);
        try {
            const prisma = new PrismaClient();
            const serverModel = new ServerModel(prisma);
            const guildModel = new GuildModel(prisma);

            const server = await serverModel.delegate.findUniqueOrThrow({ where: {discordId: serverInfo.id } });
            const gamePlaceholderGuild = await guildModel.createPlaceholderGuild(gameId!, server.id);

            let message = `Game '${gamePlaceholderGuild.game.name}' is added to the server '${server.name}'`;
            console.log(message);
            await interaction.editReply(message);
        }
        catch (error) {
            console.error(error);
            await interaction.editReply(strings.invalidGame);
        }
    },

    async autocomplete(interaction: AutocompleteInteraction) {
        const prisma = new PrismaClient();
        const gameModel = new GameModel(prisma);
        const games = await gameModel.delegate.findMany();
		await interaction.respond(
			games.map(game => ({ name: game.name, value: game.id })),
		);
    },
}

export = setupserverCommand;