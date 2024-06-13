import { PrismaClient, Prisma, Server } from '@prisma/client'
import { Model } from './model';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const messages = {
    missingObject: 'Missing server object',
    notActive: 'Server has been deleted',
    mismatchDiscordId: 'Trying to overwrite discord ID? Suspicious...'
}

export class ServerModel extends Model<Prisma.ServerDelegate, Server, Prisma.ServerWhereInput> {

    protected override __delegate: Prisma.ServerDelegate<DefaultArgs>;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.server;
    }

    /**
     * Get servers that match the filters
     * @param whereArgs the filters
     * @returns array of servers
     */
    public override async get(whereArgs?: Partial<Prisma.ServerWhereInput>): Promise<Server[]> {
        return await this.__delegate.findMany({
            where: whereArgs
        });
    }

    /**
     * Create a server
     * @param data server info
     * @returns created server
     */
    public override async create(data: any): Promise<Server> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        return await this.__delegate.create({
            data: this.__getServerData(data)
        });
    }

    /**
     * Update a server
     * @param data server info to update to
     * @param original original info
     * @returns updated server
     */
    public override async update(data: any, original: Server): Promise<Server> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        if (original.discordId && data.discordId && original.discordId !== data.discordId) {
            throw new Error(messages.mismatchDiscordId);
        }
        return await this.__delegate.update({
            where: { id: original.id },
            data: this.__getServerData(data)
        });
    }

    /**
     * Delete a server
     * @param original original info
     */
    public async delete(original: Server): Promise<void> {
        await this.__delegate.update({
            where: { id: original.id },
            data: { active: false }
        });
    }
    
    /**
     * Get all valid server properties that we can set when updating/creating
     * @param data new server info
     * @returns valid server properties
     */
    private __getServerData(data: any) {
        return { 
            name: data.name, 
            discordId: data.discordId 
        };
    }
}

