import { PrismaClient, Prisma, UserRelation } from '@prisma/client';
import { Model } from './model';

export class UserRelationModel extends Model<'UserRelation'> {
    protected override __delegate: Prisma.UserRelationDelegate;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.userRelation;
    }

    public override async findMany(args?: Prisma.UserRelationFindManyArgs) {
        return await this.__delegate.findMany(args);
    }

    public override async findOne(args: Prisma.UserRelationFindUniqueOrThrowArgs) {
        return await this.__delegate.findUniqueOrThrow(args);
    }

    public override async create(args: Prisma.UserRelationCreateArgs) {
        args.data = this.__getValidData(args.data);
        return await this.__delegate.create(args);
    }

    public override async update(args: Prisma.UserRelationUpdateArgs, _original: UserRelation) {
        const data = args.data;
        args.data = this.__getValidData(data);
        return await this.__delegate.update(args);
    }

    public override async delete(original: UserRelation): Promise<void> {
        await this.__delegate.delete({
            where: { id: original.id }
        });
    }

    protected override __getValidData(data: any, _original?: UserRelation) {
        return {
            userId: data.userId,
            roleId: data.roleId
        };
    }
}
