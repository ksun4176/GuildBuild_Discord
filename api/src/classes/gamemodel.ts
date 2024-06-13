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
    public override async get(whereArgs?: Partial<Prisma.GameWhereInput>): Promise<Game[]> {
        return await this.__delegate.findMany({
            where: whereArgs
        });
    }
    
    public override create(_data: any): Promise<Game> {
        throw new Error('Method not implemented.');
    }
    
    public override update(_data: any, _original: { id: number; name: string; }): Promise<Game> {
        throw new Error('Method not implemented.');
    }
    public override delete(_original: { id: number; name: string; }): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

