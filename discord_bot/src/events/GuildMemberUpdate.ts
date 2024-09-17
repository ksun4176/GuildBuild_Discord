import { Events, GuildMember, PartialGuildMember } from "discord.js";
import { EventInterface, GetEventInfo } from "../EventInterface";
import { UserRoleType } from "../DatabaseHelper";

const guildMemberUpdateEvent: EventInterface<Events.GuildMemberUpdate> = {
    name: Events.GuildMemberUpdate,
	async execute(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
        const rolesRemoved = oldMember.roles.cache.subtract(newMember.roles.cache);
        const rolesAdded = newMember.roles.cache.subtract(oldMember.roles.cache);
        if(rolesRemoved.size === 0 && rolesAdded.size === 0) {
            return;
        }
        try {
            const { prisma, databaseHelper } = await GetEventInfo();
            
            // get user + server
            const user = await prisma.user.findUniqueOrThrow({ where: { discordId: newMember.id } });
            const server = await prisma.server.findUniqueOrThrow({ where: { discordId: newMember.guild.id } });

            // remove roles
            let rolesCriteria = rolesRemoved.map(role => { return { discordId: role.id }; });
            const rolesToRemove = await prisma.userRole.findMany({ 
                where: { OR: rolesCriteria }
            });
            if (rolesToRemove.length > 0) {
                await prisma.userRelation.deleteMany({ 
                    where: { 
                        user: user,
                        role: { OR: rolesToRemove }
                    }
                });
            }

            // add roles
            rolesCriteria = rolesAdded.map(role => { return { discordId: role.id }; });
            let rolesToAdd = await prisma.userRole.findMany({ 
                where: { OR: rolesCriteria }
            });
            const currentRelations = await prisma.userRelation.findMany({ 
                where: {
                    user: user,
                    role: { server: server }
                }
            });
            const currentRolesIds = currentRelations.map(relation => relation.roleId);
            rolesToAdd = rolesToAdd.filter(role => currentRolesIds.indexOf(role.id) < 0);
            if (rolesToAdd.length > 0) {
                await prisma.userRelation.createMany( {
                    data: rolesToAdd.map(role => { return { userId: user.id, roleId: role.id } })
                });
            }

            if (rolesToRemove.length === 0 && rolesToAdd.length === 0) {
                return;
            }

            const placeholderGuilds = await databaseHelper.getPlaceholderGuilds(server.id);
            const placeholderGuildsIds = placeholderGuilds.map(guild => guild.id);
            const currentRelationsShared = await prisma.userRelation.findMany({
                where: { 
                    user: user,
                    role: { server: server }
                },
                include: { role: { include: { guild: true } } }
            });
            const guildRoles = currentRelationsShared
                .filter(relation =>
                    !!relation.role.roleType &&
                        [UserRoleType.GuildLead, UserRoleType.GuildManagement, UserRoleType.GuildMember].indexOf(relation.role.roleType) >= 0
                )
                .map(relation => relation.role);
            let sharedRoles = guildRoles.filter(role => placeholderGuildsIds.indexOf(role.guildId!) >= 0);
            let notSharedRoles = guildRoles.filter(role => placeholderGuildsIds.indexOf(role.guildId!) < 0);
            // remove roles from shared guild
            const sharedRolesToRemove = sharedRoles.filter(role =>
                notSharedRoles.filter(nRole => {
                    nRole.roleType === role.roleType && nRole.guild?.gameId === role.guild?.gameId
                }).length === 0
            );
            if (sharedRolesToRemove.length > 0) {
                await prisma.userRelation.deleteMany({ 
                    where: { 
                        user: user,
                        role: { OR: sharedRolesToRemove }
                    }
                });
                newMember.roles.remove(sharedRolesToRemove.filter(role => !!role.discordId).map(role => role.discordId!));
            }

            // add roles from shared guild
            const rolesToAddCriteria = notSharedRoles
                .filter(nRole =>
                    sharedRoles.filter(role => {
                        role.roleType === nRole.roleType && role.guild?.gameId === nRole.guild?.gameId
                    }).length === 0
                )
                .map(role => {
                    const guild = placeholderGuilds.find(guild => guild.gameId === role.guild?.gameId);
                    if (!guild) { return; }
                    return {
                        roleType: role.roleType,
                        serverId: role.serverId,
                        guildId: guild.id
                    };
                })
                .filter(role => !!role); // filter out blanks
            const sharedRolesToAdd = await prisma.userRole.findMany({ 
                where: { OR: rolesToAddCriteria },
                include: { guild: true }
            });
            if (sharedRolesToAdd.length > 0) {
                await prisma.userRelation.createMany( {
                    data: sharedRolesToAdd.map(role => { return { userId: user.id, roleId: role.id } })
                });
                newMember.roles.add(sharedRolesToAdd.filter(role => !!role.discordId).map(role => role.discordId!));
            }
            
            const currentRelationsEnd = await prisma.userRelation.findMany({ 
                where: { 
                    user: user,
                    role: { server: server }
                }
            });
            console.log(`User ${user.name} now has these roles: ${currentRelationsEnd.map(relation => relation.roleId)}`);
        }
        catch (error) {
            console.error(error);
        }
    },
}

export = guildMemberUpdateEvent;