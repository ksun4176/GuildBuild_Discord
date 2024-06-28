import { PrismaClient, Prisma, Server } from '@prisma/client'
import { Model } from './model';

export const messages = {
    notActive: 'Server has been deleted',
    mismatchDiscordId: 'Trying to overwrite discord ID? Suspicious...'
}

export class ServerModel extends Model<'Server'> {
    protected override __delegate: Prisma.ServerDelegate;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.server;
    }

    public override async findMany(args?: Prisma.ServerFindManyArgs) {
        return await this.__delegate.findMany(args);
    }

    public override async findOne(args: Prisma.ServerFindUniqueOrThrowArgs) {
        return await this.__delegate.findUniqueOrThrow(args);
    }

    public override async create(args: Prisma.ServerCreateArgs) {
        args.data = this.__getValidData(args.data);
        return await this.__delegate.create(args);
    }

    public override async update(args: Prisma.ServerUpdateArgs, original: Server) {
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        const data = args.data;
        if (original.discordId && data?.discordId && original.discordId !== data.discordId) {
            throw new Error(messages.mismatchDiscordId);
        }
        args.data = this.__getValidData(data);
        return await this.__delegate.update(args);
    }

    public override async delete(original: Server) {
        await this.__delegate.update({
            where: { id: original.id },
            data: { active: false }
        });
    }

    protected override __getValidData(data: any, _original?: Server) {
        return {
            name: data.name, 
            discordId: data.discordId 
        };
    }
}

