import { PrismaClient, Prisma, Game } from '@prisma/client'
import { Model } from './model';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const messages = {
    missingObject: 'Missing game object',
    missingName: 'Missing name property',
}

export class GameModel extends Model<Prisma.GameDelegate, Game, Prisma.GameWhereInput> {
    
    protected override __delegate: Prisma.GameDelegate<DefaultArgs>;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.game;
    }

    /**
     * Get games that match the filters
     * @param whereArgs the filters
     * @returns array of games
     */
    public async get(whereArgs?: Partial<Prisma.GameWhereInput>): Promise<Game[]> {
        return await this.__delegate.findMany({
            where: whereArgs
        });
    }

    /**
     * Create a game
     * @param data game info
     * @returns created game
     */
    public async create(data: any): Promise<Game> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!data.name) {
            throw new Error(messages.missingName);
        }
        return await this.__delegate.create({
            data: this.__getGameData(data)
        });
    }
    
    public override update(_data: any, _original: { id: number; name: string; }): Promise<{ id: number; name: string; }> {
        throw new Error('Method not implemented.');
    }
    public override delete(_original: { id: number; name: string; }): Promise<void> {
        throw new Error('Method not implemented.');
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

