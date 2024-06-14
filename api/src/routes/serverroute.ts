import { PrismaClient, Server } from '@prisma/client'
import { ServerModel } from "../classes/servermodel";
import { GuildRoute } from "./guildroute";
import { GameRoute } from "./gameroute";
import { Route } from "./route";

export class ServerRoute extends Route<ServerModel> {
    protected __model: ServerModel;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__model = new ServerModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (_req, res, _next) => {
            try {
                const servers = await this.__model.findMany({ where: { active: true } });
                res.status(200).json({ servers: servers });
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            const server = req.body.server;
            try {
                const serverResult = await this.__model.create({ data: server });
                res.status(201).json({ server: serverResult });
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('serverId', async (req, res, next, serverId) => {
            const parsedServerId = parseInt(serverId);
            try {
                const server = await this.__model.findOne({ where: { id: parsedServerId } });
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
                const serverResult = await this.__model.update({
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
                await this.__model.delete(serverOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }
}

