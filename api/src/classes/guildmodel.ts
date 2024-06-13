import { PrismaClient, Prisma, Guild } from '@prisma/client'
import { Model } from './model';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const messages = {
    missingObject: 'Missing guild object',
    notActive: 'Guild has been deleted',
    mismatchGame: 'Trying to overwrite game ID? Suspicious...',
    mismatchGuild: 'Trying to overwrite guild ID? Suspicious...',
    mismatchServer: 'Trying to overwrite server ID? Suspicious...'
}

export class GuildModel extends Model<Prisma.GuildDelegate, Guild, Prisma.GuildWhereInput> {
    
    protected override __delegate: Prisma.GuildDelegate<DefaultArgs>;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.guild;
    }

    /**
     * Get guilds that match the filters
     * @param whereArgs the filters
     * @returns array of guilds
     */
    public override async get(whereArgs?: Partial<Prisma.GuildWhereInput>): Promise<Guild[]> {
        return await this.__delegate.findMany({
            where: whereArgs
        });
    }

    /**
     * Create a guild
     * @param gameId game this guild belongs to
     * @param serverId server this guild belongs to
     * @param data guild info
     * @returns created guild
     */
    public override async create(data: any): Promise<Guild> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        let validData = this.__getGuildData(data);
        return await this.__delegate.create({
            data: validData
        });
    }

    /**
     * Update a guild
     * @param data guild info to update to
     * @param original original info
     * @returns updated guild
     */
    public override async update(data: any, original: Guild): Promise<Guild> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        if (original.gameId && data.gameId && original.gameId !== data.gameId) {
            throw new Error(messages.mismatchGame);
        }
        if (original.guildId && data.guildId && original.guildId !== data.guildId) {
            throw new Error(messages.mismatchGuild);
        }
        if (original.serverId && data.serverId && original.serverId !== data.serverId) {
            throw new Error(messages.mismatchServer);
        }
        return await this.__delegate.update({
            where: { id: original.id },
            data: this.__getGuildData(data)
        });
    }

    /**
     * Delete a guild
     * @param original original info
     */
    public override async delete(original: Guild): Promise<void> {
        await this.__delegate.update({
            where: { id: original.id },
            data: { active: false }
        });
    }
    
    /**
     * Get all valid guild properties that we can set when updating/creating
     * @param data new guild info
     * @returns valid guild properties
     */
    private __getGuildData(data: any) {
        return {
            gameId: data.gameId,
            guildId: data.guildId,
            name: data.name, 
            serverId: data.serverId 
        };
    }
}

