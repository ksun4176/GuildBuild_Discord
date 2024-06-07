import { Router } from "express";
import { Database } from "../Database";
import { Server } from "../classes/Server";

export class ServerRoute {
    /**
     * The database connection
     */
    private __database: Database<any>;
    /** The router */
    private __route: Router;
    public get route(): Router {
        return this.__route;
    }

    constructor(database: Database<any>) {
        this.__database = database;
        this.__route = Router();
        this.__setUpRoute();
    }

    private __setUpRoute() {
        // Get all servers
        this.__route.get('/', async (_req, res, _next) => {
            try {
                const servers = await this.__database.getServers();
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
                    throw new Error("Missing server object");
                }
                const insertId = await this.__database.insertServer(server);
                const serverResult = await this.__database.getServers(insertId);
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
                const server = await this.__database.getServers(serverId);
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
            res.status(200).json({server: req.body.serverOriginal});
        });

        // Update a server
        this.__route.put('/:serverId',  async (req, res, _next)=>{
            try {
                const serverId = parseInt(req.params.serverId);
                if (!serverId) {
                    throw new Error("Malformed ID");
                }
                const server: Server = req.body.server;
                if (!server) {
                    throw new Error("Missing server object");
                }
                const serverOriginal: Server = req.body.serverOriginal;
                if (serverOriginal.discord_id && serverOriginal.discord_id !== server.discord_id) {
                    throw new Error("Trying to overwrite discord ID? Suspicious...")
                }
                await this.__database.updateServer(serverId, server);
                const serverResult = await this.__database.getServers(serverId);
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
                const serverId = parseInt(req.params.serverId);
                if (!serverId) {
                    throw new Error("Malformed ID");
                }
                await this.__database.setServerActive(serverId, false);
                res.sendStatus(204);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}

