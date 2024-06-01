import { ClientEvents } from "discord.js";

/**
 * Interface for individual commands.
 * This contains all the information used by command handlers in discord.
 */
export interface EventInterface<Event extends keyof ClientEvents> {
    name: Event;
    once?: boolean;
    execute: (...args: ClientEvents[Event]) => void;
}