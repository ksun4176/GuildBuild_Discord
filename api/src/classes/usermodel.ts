import { PrismaClient, Prisma, User } from '@prisma/client'
import { Model } from './model';

export const messages = {
    missingObject: 'Missing user object',
    notActive: 'User has been deleted',
    mismatchDiscordId: 'Trying to overwrite discord ID? Suspicious...'
}

export class UserModel extends Model<'User'> {
    protected override __delegate: Prisma.UserDelegate;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.user;
    }

    public override async findMany(args?: Prisma.UserFindManyArgs) {
        return await this.__delegate.findMany(args);
    }

    public override async findOne(args: Prisma.UserFindUniqueOrThrowArgs) {
        return await this.__delegate.findUniqueOrThrow(args);
    }

    public override async create(args: Prisma.UserCreateArgs) {
        args.data = this.__getValidData(args.data);
        return await this.__delegate.create(args);
    }

    public override async update(args: Prisma.UserUpdateArgs, original: User) {
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

    public override async delete(original: User) {
        await this.__delegate.update({
            where: { id: original.id },
            data: { active: false }
        });
    }

    protected override __getValidData(data: any, _original?: User) {
        return {
            name: data.name, 
            discordId: data.discordId 
        };
    }
}

