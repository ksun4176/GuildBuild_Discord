import { PrismaClient, Prisma, Game } from '@prisma/client'
import { Model } from './model';

export class GameModel extends Model<'Game'> {
    protected override __delegate: Prisma.GameDelegate;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.game;
    }
    
    public override async findMany(args?: Prisma.GameFindManyArgs) {
        return await this.__delegate.findMany(args);
    }

    public override async findOne(args: Prisma.GameFindUniqueOrThrowArgs) {
        return await this.__delegate.findUniqueOrThrow(args)
    }

    public override async create(args: Prisma.GameCreateArgs) {
        args.data = this.__getValidData(args.data);
        return await this.__delegate.create( args);
    }
    
    public override update(_args: Prisma.GameUpdateArgs, _original: Game): Promise<Game> {
        throw new Error('Method not implemented.');
    }

    public override delete(_original: Game): Promise<void> {
        throw new Error('Method not implemented.');
    }

    protected override __getValidData(data: any, _original?: Game) {
        return {
            name: data.name
        }
    }
}

