import { PrismaClient, Prisma } from '@prisma/client'

export class ServerModel {
    private __delegate: Prisma.ServerDelegate;

    constructor(prisma: PrismaClient) {
        this.__delegate = prisma.server;
    }

    /**
     * Create a server if one isn't found
     * @param name Name of server
     * @param discordId Discord ID of server
     * @returns Found server or created server
     */
    public async create(name: string, discordId?: string) {
        if (!discordId) {
            return await this.__delegate.create({
                data: {
                    name: name
                }
            });
        }
        return await this.__delegate.upsert({
            create: {
                name: name,
                discordId: discordId,
            },
            where: {
                discordId: discordId
            },
            update: {
                name: name
            }
        });
    }
}

