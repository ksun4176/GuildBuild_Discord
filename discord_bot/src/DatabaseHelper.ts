import { Prisma, PrismaClient } from "@prisma/client";

export enum UserRoleType {
    ServerOwner = 1,
    Administrator = 2,
    GuildLead = 3,
    GuildManagement = 4,
    GuildMember = 5
}

export class DatabaseHelper {
    private __prisma: PrismaClient;
    
    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
    }

    //#region Server Helpers
    /**
     * Get whether a server handles a game.
     * @param serverId ID of server
     * @param gameId ID of game
     * @returns True if server handles a game, false otherwise
     */
    public async isGameInServer(serverId: number, gameId: number) {
        return !!(await this.__prisma.guild.findUnique({
            where: {
                gameId_guildId_serverId: {
                    serverId: serverId,
                    gameId: gameId,
                    guildId: '',
                },
                active: true
            }
        }));
    }
    //#endregion Server Helpers
    
    //#region Guild Helpers
    /**
     * Create a placeholder guild for a game within a server.
     * This will be used when we need to link to a game within a server but not to a particular guild
     * @param gameId ID of game
     * @param serverId ID of server
     * @returns The created guild
     */
    public async createPlaceholderGuild(gameId: number, serverId: number) {
        return await this.__prisma.guild.upsert({
            create: {
                name: `GameGuildPlaceholder${gameId}`,
                serverId: serverId,
                gameId: gameId,
                guildId: ''
            },
            where: {
                gameId_guildId_serverId: {
                    serverId: serverId,
                    gameId: gameId,
                    guildId: ''
                }
            },
            update: {
                active: true,
                name: `GameGuildPlaceholder${gameId}`
            },
            include: {
                game: true
            }
        });
    }

    /**
     * Get placeholder guilds within a server.
     * @param serverId ID of server
     * @returns Get active guilds in a server that say if a server handles a game
     */
    public async getPlaceholderGuilds(serverId: number) {
        return await this.__prisma.guild.findMany({
            where: {
                serverId: serverId,
                guildId: '',
                active: true
            },
            include: {
                game: true
            }
        });
    }
    //#endregion Guild Helpers

    //#region User Helpers
    /**
     * Check if a user has ANY of the roles asked for.
     * This will determine if they have permission to do said action
     * @param userId the user to check
     * @param rolesCriteria roles to check
     * @returns true if user has permission, false otherwise
     */
    public async userHasPermission(userId: number, rolesCriteria: Prisma.UserRoleWhereInput[]) {
        const roles = await this.__prisma.userRole.findMany({
            where: { OR: rolesCriteria }
        });

        const relations = await this.__prisma.userRelation.findMany({
            where: {
                userId: userId,
                role: { OR: roles }
            }
        });
        return relations.length > 0;
    }
    //#endregion User Helpers
}