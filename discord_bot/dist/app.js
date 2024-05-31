"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = require("discord.js");
dotenv_1.default.config();
const client = new discord_js_1.Client({ intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.GuildMessageReactions,
        discord_js_1.IntentsBitField.Flags.DirectMessages,
        discord_js_1.IntentsBitField.Flags.DirectMessageReactions,
    ] });
client.once(discord_js_1.Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.login(process.env.CLIENT_TOKEN);
