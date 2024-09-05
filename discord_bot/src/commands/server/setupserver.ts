import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface } from "../../CommandInterface";
import { PrismaClient } from "@prisma/client";
import { ServerModel } from "../../models/servermodel";
import { UserModel } from "../../models/usermodel";
import { UserRelationModel } from "../../models/userrelationmodel";
import { RoleType, UserRoleModel } from "../../models/userrolemodel";

const strings = {
    commandName: 'setupserver',
    commandDescription: 'Adds server information to the database',
    invalidServer: 'There was an issue creating the server',
    notInServer: 'This command needs to be ran in a server',
    options: {
        ownerRole: 'ownerrole',
        adminRole: 'adminrole'
    },
    optionsDescription: {
        ownerRole: 'role for server owner',
        adminRole: 'role for server admins'
    }
}

const setupserverCommand: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName(strings.commandName)
        .setDescription(strings.commandDescription)
        .addRoleOption(option => 
            option.setName(strings.options.ownerRole)
                .setDescription(strings.optionsDescription.ownerRole)
        )
        .addRoleOption(option => 
            option.setName(strings.options.adminRole)
                .setDescription(strings.optionsDescription.adminRole)
        ),
    
    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply(strings.notInServer);
            return;
        }
        await interaction.deferReply();
        const serverInfo = interaction.guild;
        const ownerInfo = await serverInfo.fetchOwner();
        const ownerRoleInfo = interaction.options.getRole(strings.options.ownerRole);
        const adminRoleInfo = interaction.options.getRole(strings.options.adminRole);

        try {
            const prisma = new PrismaClient();
            const userModel = new UserModel(prisma);
            const serverModel = new ServerModel(prisma);
            const userRoleModel = new UserRoleModel(prisma);
            const userRelationModel = new UserRelationModel(prisma);

            const owner = await userModel.create(ownerInfo.user.username, ownerInfo.id);
            const server = await serverModel.create(serverInfo.name, serverInfo.id);

            const ownerRoleName = ownerRoleInfo?.name ?? `${server.name} Owner`;
            const ownerRole = await userRoleModel.create(ownerRoleName, server.id, undefined, ownerRoleInfo?.id, RoleType.ServerOwner);
            await userRelationModel.create(owner.id, ownerRole.id);

            let message = `### Server Is Now Set Up\n` +
                `- Name: ${server.name}\n` +
                `- Owner: <@${owner.discordId}>\n`;
            
            const roleMessages = [];
            if (ownerRoleInfo) {
                roleMessages.push(`<@&${ownerRole.discordId}>`);
            }
            if (adminRoleInfo) {
                const adminRole = await userRoleModel.create(adminRoleInfo.name, server.id, undefined, adminRoleInfo.id, RoleType.Administrator);
                roleMessages.push(`<@&${adminRole.discordId}>`);
            }
            if (roleMessages.length > 0) {
                message += `- Roles Added: ${roleMessages.join(' ')}\n`;
            }

            console.log(message);
            await interaction.editReply(message);
        }
        catch (error) {
            console.error(error);
            await interaction.editReply(strings.invalidServer);
        }
    },
}

export = setupserverCommand;