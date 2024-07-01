import { PrismaClient, Server, User, UserRole } from '@prisma/client'
import { ServerModel } from "../classes/servermodel";
import { GuildRoute } from "./guildroute";
import { GameRoute } from "./gameroute";
import { Route } from "./route";
import { UserModel } from '../classes/usermodel';
import { RoleType, UserRoleModel } from '../classes/userrolemodel';
import { UserRelationModel } from '../classes/userrelationmodel';

export const messages = {
    serverIncomplete: 'The server object is missing properties',
    userNotFound: 'Unique user not found. Can be caused by mismatched id/discordId',
}

export class ServerRoute extends Route {
    private __serverModel: ServerModel;
    private __userModel: UserModel;
    private __userRoleModel: UserRoleModel;
    private __userRelationModel: UserRelationModel;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__serverModel = new ServerModel(prisma);
        this.__userModel = new UserModel(prisma);
        this.__userRoleModel = new UserRoleModel(prisma);
        this.__userRelationModel = new UserRelationModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (_req, res, _next) => {
            try {
                const servers = await this.__serverModel.findMany({ where: { active: true } });
                res.status(200).json({ servers: servers });
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
                const server = await this.__serverModel.findOne({ where: { id: parsedServerId } });
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
        this.route.get(paramRoute, (req, res, _next) => {
            let serverOriginal: Partial<Server> = req.body.serverOriginal;
            if (!serverOriginal.active) {
                // do not give past basic information if inactive
                serverOriginal = {
                    id: serverOriginal.id,
                    name: serverOriginal.name,
                    active: serverOriginal.active
                };
            }
            res.status(200).json({server: serverOriginal});
        });

        this.route.put(paramRoute, async (req, res, _next) => {
            const server = req.body.server;
            const serverOriginal: Server = req.body.serverOriginal;
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
                const serverOriginal: Server = req.body.serverOriginal;
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
     * Create a server and assign the server owner roles
     * @param server The server property from the body of the POST request
     * @returns the created server and linked owner
     */
    private async __createServer(server: any): Promise<Server & { owner: User }> {
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

        // create the server -> server owner role -> link owner + role
        const serverResult = await this.__serverModel.create({ data: server });
        const ownerRole: UserRole = server.ownerRole ?? {};
        ownerRole.name = ownerRole.name ?? `${serverResult.name} Owner`;
        ownerRole.roleType = RoleType.ServerOwner;
        ownerRole.serverId = serverResult.id;
        const ownerRoleResult = await this.__userRoleModel.create({ data: ownerRole});
        await this.__userRelationModel.create({ data: {
            userId: ownerResult[0].id,
            roleId: ownerRoleResult.id
        }});

        return {...serverResult, owner: ownerResult[0]};
    }
}

