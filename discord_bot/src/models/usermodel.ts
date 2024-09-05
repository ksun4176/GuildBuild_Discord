import { PrismaClient, Prisma } from '@prisma/client'

export class UserModel {
    public delegate: Prisma.UserDelegate;

    constructor(prisma: PrismaClient) {
        this.delegate = prisma.user;
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
            return await this.delegate.create({
                data: {
                    name: name,
                    email: email
                }
            });
        }
        return await this.delegate.upsert({
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