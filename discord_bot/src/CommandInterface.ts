import { ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";

/**
 * Interface for individual commands.
 * This contains all the information used by command handlers in discord.
 */
export interface CommandInterface {
    data: SharedSlashCommand;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}