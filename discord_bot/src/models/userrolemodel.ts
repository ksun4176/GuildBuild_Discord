import { PrismaClient, Prisma } from '@prisma/client';

export enum RoleType {
    ServerOwner = 1,
    Administrator = 2,
    GuildLead = 3,
    GuildManagement = 4,
    GuildMember = 5
}

export class UserRoleModel {
    public delegate: Prisma.UserRoleDelegate;

    constructor(prisma: PrismaClient) {
        this.delegate = prisma.userRole;
    }

    /**
     * Create a role if not found
     * @param name Name of role
     * @param serverId Server role belongs to
     * @param guildId Guild role belongs to
     * @param discordId Discord ID of role
     * @param roleType Type of role
     * @returns Found role or created role
     */
    public async create(name: string, serverId: number, guildId?: number, discordId?: string, roleType?: RoleType) {
        if (!discordId) {
            return await this.delegate.create({
                data: {
                    name: name,
                    serverId: serverId,
                    guildId: guildId,
                    roleType: roleType
                }
            });
        }
        return await this.delegate.upsert({
            create: {
                name: name,
                serverId: serverId,
                guildId: guildId,
                discordId: discordId,
                roleType: roleType
            },
            where: {
                discordId: discordId
            },
            update: {
                name: name,
                serverId: serverId,
                guildId: guildId,
                roleType: roleType
            }
        });
    }
}
