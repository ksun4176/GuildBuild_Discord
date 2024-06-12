import { Router } from "express";
import { PrismaClient, Server } from '@prisma/client'
import { ServerFunctions } from "../classes/server";

export class ServerRoute {
    /**
     * The prisma client that connects to the database
     */ 
    private __prisma: PrismaClient;
    private __server: ServerFunctions;
    /** The router */
    private __route: Router;
    public get route(): Router {
        return this.__route;
    }

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
        this.__server = new ServerFunctions(this.__prisma);
        this.__route = Router();
        this.__setUpRoute();
    }

    /**
     * Set up all routes
     */
    private __setUpRoute() {
        this.__route.get('/', async (_req, res, _next) => {
            try {
                const servers = await this.__server.getServers({ active: true });
                res.status(200).json({servers: servers});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.__route.post('/', async (req, res, _next) => {
            try {
                const server = req.body.server;
                const serverResult = await this.__server.createServer(server);
                res.status(201).json({server: serverResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.__route.param('serverId', async (req, res, next, serverId)=> {
            try {
                const servers = await this.__server.getServers({ id: +serverId });
                if (servers.length !== 1) {
                    throw new Error('Server not found');
                }
                req.body.serverOriginal = servers[0];
                next();
            }
            catch (err) {
                console.log(err);
                res.sendStatus(404);
            }
        });

        this.__route.get('/:serverId',  (req, res, _next) => {
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

        this.__route.put('/:serverId',  async (req, res, _next)=>{
            try {
                const server = req.body.server;
                const serverOriginal: Server = req.body.serverOriginal;
                const serverResult = await this.__server.updateServer(server, serverOriginal);
                res.status(202).json({server: serverResult});
            }
            catch (err) {
                console.log(err);
                res.sendStatus(400);
            }
        });

        this.__route.delete('/:serverId', async (req, res, _next)=>{
            try {
                const serverOriginal: Server = req.body.serverOriginal;
                await this.__server.deactivateServer(serverOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.log(err);
                res.sendStatus(500);
            }
        });
    }
}

