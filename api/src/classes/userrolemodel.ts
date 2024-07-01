import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import { Model } from './model';

export const messages = {
    mismatchGuild: 'Trying to overwrite guild ID? Suspicious...',
    mismatchServer: 'Trying to overwrite server ID? Suspicious...'
}

export enum RoleType {
    ServerOwner = 1,
    Administrator = 2,
    GuildLead = 3,
    GuildManagement = 4,
    GuildMember = 5
}

export class UserRoleModel extends Model<'UserRole'> {
    protected override __delegate: Prisma.UserRoleDelegate;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.userRole;
    }

    public override async findMany(args?: Prisma.UserRoleFindManyArgs) {
        return await this.__delegate.findMany(args);
    }

    public override async findOne(args: Prisma.UserRoleFindUniqueOrThrowArgs) {
        return await this.__delegate.findUniqueOrThrow(args);
    }

    public override async create(args: Prisma.UserRoleCreateArgs) {
        args.data = this.__getValidData(args.data);
        return await this.__delegate.create(args);
    }

    public override async update(args: Prisma.UserRoleUpdateArgs, original: UserRole) {
        const data = args.data;
        if (original.guildId && data?.guildId && original.guildId !== data.guildId) {
            throw new Error(messages.mismatchGuild);
        }
        if (original.serverId && data?.serverId && original.serverId !== data.serverId) {
            throw new Error(messages.mismatchServer);
        }
        args.data = this.__getValidData(data);
        return await this.__delegate.update(args);
    }

    public override async delete(original: UserRole): Promise<void> {
        await this.__delegate.delete({
            where: { id: original.id }
        });
    }

    protected override __getValidData(data: any, _original?: UserRole) {
        return {
            name: data.name,
            roleType: data.roleType,
            serverId: data.serverId,
            guildId: data.guildId,
            discordId: data.discordId
        };
    }
}
