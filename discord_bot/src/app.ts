import dotenv from "dotenv";
import { Client, Collection, Events, IntentsBitField } from "discord.js";
import { CommandInterface } from "./commands/CommandInterface";
import { executeOnAllCommands } from "./commands/CommandHelper";

// augment client with the command property
declare module "discord.js" {
    interface Client {
        commands: Collection<string, CommandInterface>
  }
}
dotenv.config();

// create a Discord client with the right intents
const client: Client = new Client({ intents: [
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
] });

// add all commands to be handled
client.commands = new Collection();
const commandCallbackFn = (command: CommandInterface) => {
    client.commands.set(command.data.name, command);
}
executeOnAllCommands(commandCallbackFn);

// log in a discord client as the bot
client.once(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.login(process.env.CLIENT_TOKEN);

// handle InteractionCreate event
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command: CommandInterface | undefined = interaction.client.commands.get(interaction.commandName);

	if (!command) {
	    console.error(`No command matching ${interaction.commandName} was found.`);
	    return;
	}

	try {
		await command.execute(interaction);
	} 
    catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} 
        else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});