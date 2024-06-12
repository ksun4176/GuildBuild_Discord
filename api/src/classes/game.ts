import { PrismaClient, Prisma, Game } from '@prisma/client'

export const messages = {
    missingObject: 'Missing server object',
    missingName: 'Missing name property',
}

export class GameFunctions {
    /**
     * The prisma client that connects to the database
     */ 
    private __prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
    }

    /**
     * Get games that match the filters
     * @param whereArgs the filters
     * @returns array of games
     */
    public async getGames(whereArgs?: Partial<Prisma.GameWhereInput>): Promise<Game[]> {
        return await this.__prisma.game.findMany({
            where: whereArgs
        });
    }

    /**
     * Create a game
     * @param data game info
     * @returns created game
     */
    public async createGame(data: any): Promise<Game> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!data.name) {
            throw new Error(messages.missingName);
        }
        return await this.__prisma.game.create({
            data: this.__getGameData(data)
        });
    }

    /**
     * Get all valid game properties that we can set when updating/creating
     * @param data new game info
     * @returns valid game properties
     */
    private __getGameData(data: any) {
        return { 
            name: data.name, 
        };
    }
}

