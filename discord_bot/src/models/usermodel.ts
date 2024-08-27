import { PrismaClient, Prisma } from '@prisma/client'

export class UserModel {
    private __delegate: Prisma.UserDelegate;

    constructor(prisma: PrismaClient) {
        this.__delegate = prisma.user;
    }

    /**
     * Create a user if one isn't found
     * @param name Name of user
     * @param discordId Discord ID of user
     * @param email Email of user
     * @returns Found user or created user
     */
    public async create(name: string, discordId?: string, email?: string) {
        if (!discordId) {
            return await this.__delegate.create({
                data: {
                    name: name,
                    email: email
                }
            });
        }
        return await this.__delegate.upsert({
            create: {
                name: name,
                discordId: discordId,
                email: email
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