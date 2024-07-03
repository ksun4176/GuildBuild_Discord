import { PrismaClient, Prisma, Guild } from '@prisma/client';
import { Model } from './model';

export const messages = {
    notActive: 'Guild has been deleted',
    mismatchGame: 'Trying to overwrite game ID? Suspicious...',
    mismatchGuild: 'Trying to overwrite guild ID? Suspicious...',
    mismatchServer: 'Trying to overwrite server ID? Suspicious...'
}

export class GuildModel extends Model<'Guild'> {
    protected override __delegate: Prisma.GuildDelegate;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.guild;
    }

    public override async findMany(args?: Prisma.GuildFindManyArgs) {
        return await this.__delegate.findMany(args);
    }

    public override async findOne(args: Prisma.GuildFindUniqueOrThrowArgs) {
        return await this.__delegate.findUniqueOrThrow(args);
    }

    public override async create(args: Prisma.GuildCreateArgs) {
        args.data = this.__getValidData(args.data);
        return await this.__delegate.create(args);
    }

    public override async update(args: Prisma.GuildUpdateArgs, original: Guild) {
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        const data = args.data;
        if (original.gameId && data?.gameId && original.gameId !== data.gameId) {
            throw new Error(messages.mismatchGame);
        }
        if (original.guildId && data?.guildId && original.guildId !== data.guildId) {
            throw new Error(messages.mismatchGuild);
        }
        if (original.serverId && data?.serverId && original.serverId !== data.serverId) {
            throw new Error(messages.mismatchServer);
        }
        args.data = this.__getValidData(data);
        return await this.__delegate.update(args);
    }

    public override async delete(original: Guild): Promise<void> {
        await this.__delegate.update({
            where: { id: original.id },
            data: { active: false }
        });
    }

    protected override __getValidData(data: any, _original?: Guild) {
        return {
            gameId: data.gameId,
            guildId: data.guildId,
            name: data.name,
            serverId: data.serverId
        };
    }

    /**
     * Add the criteria that will let us know if a guild is a placeholder guild that signals a server supports a game
     * @param whereInput the input to be added to
     * @param inverse whether to inverse the criteria
     * @returns the updated input
     */
    public static addPlaceholderCriteria(whereInput: Prisma.GuildWhereInput, inverse?: boolean) {
        whereInput.guildId = inverse ? {not: ''} : '';
        return whereInput;
    }
    
    /**
     * Get whether a guild is a placeholder guild that signals a server supports a game
     * @param guild The guild to check
     * @returns True if is placeholder, false otherwise
     */
    public static isPlaceholderGuild(guild: Guild) {
        return guild.guildId === '';
    }
    
    /**
     * Get whether a placeholder guild exists for a server + game.
     * This signals that a server supports a game
     * @param serverId The server to check
     * @param gameId The game to check
     * @returns True if a placeholder guild exists, false otherwise.
     */
    public async hasPlaceholderGuild(serverId: number, gameId: number): Promise<boolean> {
        let existingGuildsArgs: Prisma.GuildFindManyArgs = {
            where: { 
                serverId: serverId,
                gameId: gameId,
                active: true
            }
        }
        existingGuildsArgs.where = GuildModel.addPlaceholderCriteria(existingGuildsArgs.where!);
        const existingGuilds = await this.findMany(existingGuildsArgs);
        return existingGuilds.length > 0;
    }

    /**
     * Create a placeholder guild for a game within a server.
     * This will be used when we need to link to a game within a server but not to a particular guild
     * @param gameId ID of game
     * @param serverId ID of server
     * @returns The created guild
     */
    public async createPlaceholderGuild(gameId: number, serverId: number) {
        const args: Prisma.GuildUpsertArgs = {
            where: {
                gameId_guildId_serverId: {
                    gameId: gameId,
                    serverId: serverId,
                    guildId: ''
                }
            },
            update: {
                active: true
            },
            create: {
                gameId: gameId,
                serverId: serverId,
                guildId: '',
                name: `GameGuildPlaceholder${gameId}`
            }
        };
        return await this.__delegate.upsert(args);
    }
}
