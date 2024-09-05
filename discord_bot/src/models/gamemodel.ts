import { PrismaClient, Prisma } from '@prisma/client'

export class GameModel {
    public delegate: Prisma.GameDelegate;

    constructor(prisma: PrismaClient) {
        this.delegate = prisma.game;
    }
}
