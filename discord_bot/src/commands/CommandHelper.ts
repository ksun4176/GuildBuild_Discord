import fs from "fs";
import path from "path";
import { CommandInterface } from "./CommandInterface";

/**
 * Find all commands that are configured correctly and execute a callback on them
 * @param callbackFn the callback
 */
export const executeOnAllCommands = (callbackFn: (command: CommandInterface) => unknown) => {
    const commandFolders = fs.readdirSync(__dirname);
    for (const folder of commandFolders) {
        const commandsPath = path.join(__dirname, folder);
        // all commands will be in a subdirectory
        if(!fs.lstatSync(commandsPath).isDirectory()) { continue; }
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                callbackFn(command);
            } 
        else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}