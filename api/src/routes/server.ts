import { RouterOptions } from "express";
import { PrismaClient, Server } from '@prisma/client'
import { ServerModel } from "../classes/server";
import { GuildRoute } from "./guild";
import { Route } from "./route";

export class ServerRoute extends Route<ServerModel> {
    protected __model: ServerModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new ServerModel(prisma);
    }

    protected override __setUpRoute() {
        this.route.get('/', async (_req, res, _next) => {
            try {
                const servers = await this.__model.get({ active: true });
                res.status(200).json({servers: servers});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post('/', async (req, res, _next) => {
            try {
                const server = req.body.server;
                const serverResult = await this.__model.create(server);
                res.status(201).json({server: serverResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('serverId', async (req, res, next, serverId) => {
            try {
                const servers = await this.__model.get({ id: +serverId });
                if (servers.length !== 1) {
                    throw new Error('Server not found');
                }
                req.body.serverOriginal = servers[0];
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const guildRoute = new GuildRoute(this.__prisma, { mergeParams: true }).route;
        this.route.use('/:serverId/guilds', guildRoute);

        this.route.get('/:serverId', (req, res, _next) => {
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

        this.route.put('/:serverId', async (req, res, _next) => {
            try {
                const server = req.body.server;
                const serverOriginal: Server = req.body.serverOriginal;
                const serverResult = await this.__model.update(server, serverOriginal);
                res.status(202).json({server: serverResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.delete('/:serverId', async (req, res, _next) => {
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

