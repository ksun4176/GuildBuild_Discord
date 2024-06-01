import { CommandInteraction, SlashCommandBuilder } from "discord.js";

/**
 * Interface for individual commands.
 * This contains all the information used by command handlers in discord.
 */
export interface CommandInterface {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}