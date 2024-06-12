import { PrismaClient, Prisma, Server } from '@prisma/client'

export const messages = {
    missingObject: 'Missing server object',
    missingName: 'Missing name property',
    notActive: 'Server has been deleted',
    mismatchDiscordId: 'Trying to overwrite discord ID? Suspicious...'
}

export class ServerFunctions {
    /**
     * The prisma client that connects to the database
     */ 
    private __prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
    }

    /**
     * Get servers that match the filters
     * @param whereArgs the filters
     * @returns array of servers
     */
    public async getServers(whereArgs?: Partial<Prisma.ServerWhereInput>): Promise<Server[]> {
        return await this.__prisma.server.findMany({
            where: whereArgs
        });
    }

    /**
     * Create a server
     * @param data server info
     * @returns created server
     */
    public async createServer(data: any): Promise<Server> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!data.name) {
            throw new Error(messages.missingName);
        }
        return await this.__prisma.server.create({
            data: this.__getServerData(data)
        });
    }

    /**
     * Update a server
     * @param data server info to update to
     * @param original original info
     * @returns updated server
     */
    public async updateServer(data: any, original: Server): Promise<Server> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        if (original.discordId && data.discordId && original.discordId !== data.discordId) {
            throw new Error(messages.mismatchDiscordId);
        }
        return await this.__prisma.server.update({
            where: { id: original.id },
            data: this.__getServerData(data)
        });
    }

    /**
     * Deactivate a server
     * @param original original info
     */
    public async deactivateServer(original: Server): Promise<void> {
        await this.__prisma.server.update({
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

