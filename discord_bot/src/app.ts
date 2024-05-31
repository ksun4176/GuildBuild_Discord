import dotenv from "dotenv";
import { Client, Events, IntentsBitField } from "discord.js";

dotenv.config();

const client: Client = new Client({ intents: [
  IntentsBitField.Flags.Guilds, 
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.GuildMessageReactions,
  IntentsBitField.Flags.DirectMessages,
  IntentsBitField.Flags.DirectMessageReactions,
] });

client.once(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.login(process.env.CLIENT_TOKEN);