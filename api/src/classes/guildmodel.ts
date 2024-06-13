import { PrismaClient, Prisma, Guild } from '@prisma/client'
import { Model } from './model';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const messages = {
    missingObject: 'Missing guild object',
    missingServer: 'Missing which server this guild belongs to',
    missingGame: 'Missing which game this guild is for',
    missingGuildId: 'Missing in game guild ID',
    missingName: 'Missing name property',
    notActive: 'Guild has been deleted',
    mismatchGame: 'Trying to overwrite game ID? Suspicious...',
    mismatchGuild: 'Trying to overwrite guild ID? Suspicious...'
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
    public async get(whereArgs?: Partial<Prisma.GuildWhereInput>): Promise<Guild[]> {
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
    public async create(data: any): Promise<Guild> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!data.gameId) {
            throw new Error(messages.missingGame);
        }
        if (!data.serverId) {
            throw new Error(messages.missingServer);
        }
        if (!data.guildId) {
            throw new Error(messages.missingGuildId);
        }
        if (!data.name) {
            throw new Error(messages.missingName);
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
    public async update(data: any, original: Guild): Promise<Guild> {
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
        return await this.__delegate.update({
            where: { id: original.id },
            data: this.__getGuildData(data)
        });
    }

    /**
     * Delete a guild
     * @param original original info
     */
    public async delete(original: Guild): Promise<void> {
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

