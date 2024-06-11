import { Router } from "express";
import { PrismaClient, Prisma } from '@prisma/client'

const ServerInclude = Prisma.validator<Prisma.ServerInclude>()({
    // add other relations to include
});
  
export type Server = Prisma.ServerGetPayload<{
    include: typeof ServerInclude;
}>;

export class ServerRoute {
    /**
     * The prisma client that connects to the database
     */ 
    private __prisma: PrismaClient;
    /** The router */
    private __route: Router;
    public get route(): Router {
        return this.__route;
    }

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
        this.__route = Router();
        this.__setUpRoute();
    }

    private __setUpRoute() {
        // Get all servers
        this.__route.get('/', async (_req, res, _next) => {
            try {
                const servers = await this.__prisma.server.findMany({
                    where: { active: true }
                });
                res.status(200).json({servers: servers});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        // Add a new server
        this.__route.post('/', async (req, res, _next) => {
            try {
                const server: Server = req.body.server;
                if (!server) {
                    throw new Error('Missing server object');
                }
                if (!server.name) {
                    throw new Error('No name provided');
                }
                const serverResult = await this.__prisma.server.create({
                    data: { name: server.name }
                });
                res.json({server: serverResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        // Grab info on the current state of server information
        this.__route.param('serverId', async (req, res, next, serverId)=> {
            try {
                const serverIdParsed = parseInt(serverId);
                if (!serverIdParsed) {
                    throw new Error('Malformed ID');
                }
                const server = await this.__prisma.server.findFirstOrThrow({
                    where: {id: serverIdParsed}
                });
                req.body.serverOriginal = server;
                next();
            }
            catch (err) {
                console.log(err);
                res.sendStatus(404);
            }
        });

        // Grab a server
        this.__route.get('/:serverId',  (req, res, _next) => {
            const serverOriginal = req.body.serverOriginal;
            if (!serverOriginal.active) {
                res.json({server: {
                    id: serverOriginal.id,
                    name: serverOriginal.name,
                    active: serverOriginal.active
                }})
            }
            else {
                res.json({server: serverOriginal});
            }
            res.status(200).json({server: req.body.serverOriginal});
        });

        // Update a server
        this.__route.put('/:serverId',  async (req, res, _next)=>{
            try {
                const server: Server = req.body.server;
                if (!server) {
                    throw new Error('Missing server object');
                }
                const serverOriginal: Server = req.body.serverOriginal;
                if (!serverOriginal.active) {
                    throw new Error('This server has been deleted');
                }
                if (serverOriginal.id !== server.id) {
                    throw new Error('ID mismatch found');
                }
                if (serverOriginal.discordId && serverOriginal.discordId !== server.discordId) {
                    throw new Error('Trying to overwrite discord ID? Suspicious...');
                }
                const serverResult = await this.__prisma.server.update({
                    where: { id: serverOriginal.id },
                    data: {
                        name: server.name,
                        discordId: server.discordId
                    }
                });
                res.json({server: serverResult});
            }
            catch (err) {
                console.log(err);
                res.sendStatus(400);
            }
        });

        /** Delete one server */
        this.__route.delete('/:serverId', async (req, res, _next)=>{
            try {
                const serverOriginal: Server = req.body.serverOriginal;
                await this.__prisma.server.update({
                    where: { id: serverOriginal.id },
                    data: { active: false }
                });
                res.sendStatus(204);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}

