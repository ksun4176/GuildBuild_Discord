import { Router } from "express";
import { PrismaClient, Prisma } from '@prisma/client'

const ServerInclude = Prisma.validator<Prisma.ServerInclude>()({
    // add other relations to include
});

export type Server = Prisma.ServerGetPayload<{
    include: typeof ServerInclude;
}>;

export const messages = {
    missingObject: 'Missing server object',
    missingName: 'Missing name property',
    malformedId: 'ID is not in right format',
    notActive: 'Server has been deleted',
    mismatchDiscordId: 'Trying to overwrite discord ID? Suspicious...'
}

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

    /**
     * Set up all routes
     */
    private __setUpRoute() {
        this.__route.get('/', async (req, res, _next) => {
            try {
                const servers = await this.__getAllServers(true);
                res.status(200).json({servers: servers});
            }
            catch (err) {
                console.error(err, req);
                res.sendStatus(500);
            }
        });

        this.__route.post('/', async (req, res, _next) => {
            try {
                const server = req.body.server;
                const serverResult = await this.__createServer(server);
                res.status(201).json({server: serverResult});
            }
            catch (err) {
                console.error(err, req);
                res.sendStatus(400);
            }
        });

        this.__route.param('serverId', async (req, res, next, serverId)=> {
            try {
                const server = await this.__getServerSingle(serverId);
                req.body.serverOriginal = server;
                next();
            }
            catch (err) {
                console.log(err, req);
                res.sendStatus(404);
            }
        });

        // Grab a server
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

        // Update a server
        this.__route.put('/:serverId',  async (req, res, _next)=>{
            try {
                const server = req.body.server;
                const serverOriginal: Server = req.body.serverOriginal;
                const serverResult = await this.__updateServer(server, serverOriginal);
                res.status(202).json({server: serverResult});
            }
            catch (err) {
                console.log(err, req);
                res.sendStatus(400);
            }
        });

        /** Delete one server */
        this.__route.delete('/:serverId', async (req, res, _next)=>{
            try {
                const serverOriginal: Server = req.body.serverOriginal;
                await this.__deactivateServer(serverOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.log(err, req);
                res.sendStatus(500);
            }
        });
    }

    /**
     * Get all servers
     * @param onlyActive whether we want only active servers 
     * @returns array of servers
     */
    private async __getAllServers(onlyActive?: boolean): Promise<Server[]> {
        let args: Prisma.ServerFindManyArgs = {};
        if (onlyActive) {
            args.where = { active: true }
        }
        return await this.__prisma.server.findMany(args);
    }

    /**
     * Get a single server
     * @param id ID of server
     * @returns the server
     */
    private async __getServerSingle(id: any): Promise<Server> {
        const serverIdParsed = parseInt(id);
        if (!serverIdParsed) {
            throw new Error(messages.malformedId);
        }
        return await this.__prisma.server.findFirstOrThrow({
            where: {id: serverIdParsed}
        });
    }

    /**
     * Create a server
     * @param data server info
     * @returns created server
     */
    private async __createServer(data: any): Promise<Server> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!data.name) {
            throw new Error(messages.missingName);
        }
        return await this.__prisma.server.create({
            data: this.__getServerData(data)
        });
    }

    /**
     * Update a server
     * @param data server info to update to
     * @param original original info
     * @returns updated server
     */
    private async __updateServer(data: any, original: Server): Promise<Server> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        if (original.discordId && data.discordId && original.discordId !== data.discordId) {
            throw new Error(messages.mismatchDiscordId);
        }
        return await this.__prisma.server.update({
            where: { id: original.id },
            data: this.__getServerData(data)
        });
    }

    /**
     * Get all valid server properties that we can set when updating/creating
     * @param data new server info
     * @returns valid server properties
     */
    private __getServerData(data: any) {
        return { 
            name: data.name, 
            discordId: data.discordId 
        };
    }

    /**
     * Deactivate a server
     * @param original original info
     */
    private async __deactivateServer(original: Server): Promise<void> {
        await this.__prisma.server.update({
            where: { id: original.id },
            data: { active: false }
        });
    }
}

