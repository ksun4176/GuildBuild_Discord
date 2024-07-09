import { Prisma, PrismaClient, Server, UserRole } from '@prisma/client'
import { ServerModel } from "../classes/servermodel";
import { GuildRoute } from "./guildroute";
import { GameRoute } from "./gameroute";
import { Route } from "./route";
import { UserModel } from '../classes/usermodel';
import { RoleType, UserRoleModel } from '../classes/userrolemodel';
import { UserRelationModel } from '../classes/userrelationmodel';
import { GuildModel } from '../classes/guildmodel';

// Include:
// - active guilds
// - owner + admins details
const serverInclude = Prisma.validator<Prisma.ServerInclude>()({
    guilds: {
        where: { active: true }
    },
    roles: {
        where: { roleType: { in: [RoleType.ServerOwner, RoleType.Administrator] } },
        include: { users: true }
    },
});
type ServerDetailed = Prisma.ServerGetPayload<{
    include: typeof serverInclude;
}>;

export const messages = {
    serverIncomplete: 'The server object is missing properties',
    userNotFound: 'Unique user not found. Can be caused by mismatched id/discordId',
}

export class ServerRoute extends Route {
    private __serverModel: ServerModel;
    private __guildModel: GuildModel;
    private __userModel: UserModel;
    private __userRoleModel: UserRoleModel;
    private __userRelationModel: UserRelationModel;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__serverModel = new ServerModel(prisma);
        this.__guildModel = new GuildModel(prisma);
        this.__userModel = new UserModel(prisma);
        this.__userRoleModel = new UserRoleModel(prisma);
        this.__userRelationModel = new UserRelationModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (req, res, _next) => {
            const { gameId }  = req.query;
            const parsedGameId = typeof gameId === "string" ? parseInt(gameId) : undefined;
            try {
                const result = await this.__getServersSummary(parsedGameId);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            try {
                const result = await this.__createServer(req.body.server);
                res.status(201).json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('serverId', async (req, res, next, serverId) => {
            const parsedServerId = parseInt(serverId);
            try {
                const server = await this.__serverModel.findOne({ 
                    where: { id: parsedServerId },
                    include: serverInclude
                });
                req.body.serverOriginal = server;
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const guildRoute = new GuildRoute(this.__prisma, { mergeParams: true }).route;
        this.route.use('/:serverId/guilds', guildRoute);
        const gameRoute = new GameRoute(this.__prisma, { mergeParams: true }).route;
        this.route.use('/:serverId/games', gameRoute);

        const paramRoute = '/:serverId';
        this.route.get(paramRoute, async (req, res, _next) => {
            const result = await this.__getServerDetailed(req.body.serverOriginal);
            res.status(200).json(result);
        });

        this.route.put(paramRoute, async (req, res, _next) => {
            const server = req.body.server;
            const serverOriginal: ServerDetailed = req.body.serverOriginal;
            try {
                const serverResult = await this.__serverModel.update({
                    data: server,
                    where: { id: serverOriginal.id }
                }, serverOriginal);
                res.status(202).json({ server: serverResult });
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.delete(paramRoute, async (req, res, _next) => {
            try {
                const serverOriginal: ServerDetailed = req.body.serverOriginal;
                await this.__serverModel.delete(serverOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }

    /**
     * Get a list of servers with only their basic details
     * @param gameId the game to see if a server supports it
     * @returns List of servers to show in a summary view
     */
    private async __getServersSummary(gameId?: number) {
        let servers = await this.__serverModel.findMany({
            where: { active: true },
            select: {
                id: true,
                name: true,
                discordId: true
            }
        });

        if (gameId) {
            const guildArgs: Prisma.GuildFindManyArgs = {
                where: {
                    serverId: { in: servers.map((server) => server.id) },
                    active: true,
                    gameId: gameId
                },
                select: {
                    serverId: true
                }
            };
            guildArgs.where = GuildModel.addPlaceholderCriteria(guildArgs.where!);
            const guilds = await this.__guildModel.findMany(guildArgs);
            const validServerIds = guilds.map((guild) => guild.serverId);
            servers = servers.filter((server) => server.id in validServerIds);
        }

        return servers;
    }

    /**
     * Get the details on a single server
     * @param server server to get details about
     * @returns server detail
     */
    private async __getServerDetailed(server: ServerDetailed) {
        if (!server.active) {
            // do not give past basic information if inactive
            return {
                id: server.id,
                name: server.name,
                discordId: server.discordId,
                active: server.active
            };
        };
        
        const guilds = server.guilds;
        const guildIds = guilds.filter((guild) => !GuildModel.isPlaceholderGuild(guild)).map((guild) => guild.id);
        const gameIds = [...new Set(guilds.map((guild) => guild.gameId))];

        const roles = server.roles;
        const ownerRole = roles.find((role) => role.roleType === RoleType.ServerOwner);
        const adminRole = roles.find((role) => role.roleType === RoleType.Administrator);
        
        let owner;
        if (ownerRole && ownerRole.users.length > 0) {
            owner = ownerRole.users[0].userId;
        }
        let admins;
        if (adminRole && adminRole.users.length > 0) {
            admins = adminRole.users.map((user) => user.userId);
        }

        return {
            id: server.id,
            name: server.name,
            discordId: server.discordId,
            active: server.active,
            guilds: guildIds,
            games: gameIds,
            owner: {
                roleId: ownerRole?.id,
                userId: owner
            },
            admins: {
                roleId: adminRole?.id,
                userIds: admins
            }
        };
    }

    /**
     * Create a server and assign the server owner roles
     * @param server The server property from the body of the POST request
     * @returns the created server and linked owner
     */
    private async __createServer(server: any) {
        // check if required properties are set
        if (!server || !server.name || !server.owner) {
            throw new Error(messages.serverIncomplete);
        }

        // verify that owner is valid user
        const ownerInfo = server.owner;
        const ownerResult = await this.__userModel.findMany({ where: {
            OR: [
                {
                    id: ownerInfo.id
                },
                {
                    discordId: ownerInfo.discordId
                }
            ]
        }});
        if (ownerResult.length !== 1) {
            throw new Error(messages.userNotFound);
        }

        // create the server -> server owner role -> link owner + role -> server admin role
        const serverResult = await this.__serverModel.create({ data: server });
        const ownerRole = this.__getRoleFromType(serverResult, RoleType.ServerOwner, server.ownerRole);
        const ownerRoleResult = await this.__userRoleModel.create({ data: ownerRole });
        await this.__userRelationModel.create({ data: {
            userId: ownerResult[0].id,
            roleId: ownerRoleResult.id
        }});
        const adminRole = this.__getRoleFromType(serverResult, RoleType.Administrator, server.adminRole);
        await this.__userRoleModel.create({ data: adminRole });

        return {...serverResult, owner: ownerResult[0]};
    }

    /**
     * Get the UserRole object based on type and server properties
     * @param server Server the role belongs to
     * @param roleType The role type to add
     * @param reqRole role information from HTTP request
     * @returns role to add
     */
    private __getRoleFromType(server: Server, roleType: RoleType, reqRole?: any): UserRole {
        let suffix = '';
        switch (roleType) {
            case RoleType.ServerOwner:
                suffix = 'Owner';
                break;
            case RoleType.Administrator:
                suffix = 'Administrator';
                break;
        }
        if (suffix) {
            suffix = ' ' + suffix;
        }

        const role: UserRole = reqRole ?? {};
        role.name = role.name ?? `${server.name}${suffix}`;
        role.roleType = roleType;
        role.serverId = server.id;

        return role;
    }
}

