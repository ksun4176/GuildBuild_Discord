import { PrismaClient, Prisma } from '@prisma/client';

export class GuildModel {
    public delegate: Prisma.GuildDelegate;

    constructor(prisma: PrismaClient) {
        this.delegate = prisma.guild;
    }

    /**
     * Create a guild if one isn't found
     * @param name Name of user
     * @param serverId ID of server to add guild
     * @param gameId ID of game that guild is for
     * @param guildId In game ID of guild
     * @returns Found guild or created guild
     */
    public async create(name: string, serverId: number, gameId: number, guildId: string) {
        return await this.delegate.upsert({
            create: {
                name: name,
                serverId: serverId,
                gameId: gameId,
                guildId: guildId
            },
            where: {
                gameId_guildId_serverId: {
                    serverId: serverId,
                    gameId: gameId,
                    guildId: guildId
                }
            },
            update: {
                active: true,
                name: name
            },
            include: {
                game: true
            }
        });
    }

    /**
     * Create a placeholder guild for a game within a server.
     * This will be used when we need to link to a game within a server but not to a particular guild
     * @param gameId ID of game
     * @param serverId ID of server
     * @returns The created guild
     */
    public async createPlaceholderGuild(gameId: number, serverId: number) {
        return await this.create(`GameGuildPlaceholder${gameId}`, serverId, gameId, '');
    }

    /**
     * Get placeholder guilds within a server.
     * @param serverId ID of server
     * @returns Get active guilds in a server that say if a server handles a game
     */
    public async getPlaceholderGuilds(serverId: number) {
        return await this.delegate.findMany({
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

    /**
     * Get whether a server handles a game.
     * @param serverId ID of server
     * @param gameId ID of game
     * @returns True if server handles a game, false otherwise
     */
    public async getGameInServer(serverId: number, gameId: number) {
        return !!(await this.delegate.findUnique({
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
}
