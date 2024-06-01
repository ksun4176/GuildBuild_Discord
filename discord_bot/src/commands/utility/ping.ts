import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface } from "../../CommandInterface";

const pingCommand: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    
    async execute(interaction : CommandInteraction) {
        await interaction.reply('Pong!');
    },
}

export = pingCommand;