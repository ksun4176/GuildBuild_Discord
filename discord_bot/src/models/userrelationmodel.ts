import { PrismaClient, Prisma } from '@prisma/client';

export class UserRelationModel {
    public delegate: Prisma.UserRelationDelegate;

    constructor(prisma: PrismaClient) {
        this.delegate = prisma.userRelation;
    }

    /**
     * Link a user to a role
     * @param userId User to link
     * @param roleId Role to link
     * @returns Link between user and role
     */
    public async create(userId: number, roleId: number) {
        return await this.delegate.upsert({
            create: {
                userId: userId,
                roleId: roleId
            },
            where: {
                userId_roleId: {
                    userId: userId,
                    roleId: roleId
                }
            },
            update: {}
        });
    }
}
