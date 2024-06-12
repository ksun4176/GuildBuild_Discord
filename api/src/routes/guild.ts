import { Router } from "express";
import { PrismaClient, Guild, Prisma } from '@prisma/client'
import { GuildFunctions } from "../classes/guild";
import { RouteParameters } from 'express-serve-static-core';

type Params<T extends string> = Partial<RouteParameters<':gameId'>> & Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export class GuildRoute {
    /**
     * The prisma client that connects to the database
     */ 
    private __prisma: PrismaClient;
    private __guild: GuildFunctions;
    /** The router */
    private __route: Router;
    public get route(): Router {
        return this.__route;
    }

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
        this.__guild = new GuildFunctions(this.__prisma);
        this.__route = Router({ mergeParams: true });
        this.__setUpRoute();
    }

    /**
     * Set up all routes
     */
    private __setUpRoute() {
        const rootRoute = '/';
        this.__route.get<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            let { gameId, serverId } = req.params;
            const parsedGameId = gameId ? parseInt(gameId) : undefined;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                const whereArgs: Partial<Prisma.GuildWhereInput> = {
                    active: true
                };
                if (parsedGameId) {
                    whereArgs.gameId = parsedGameId;
                }
                else if (parsedServerId) {
                    whereArgs.serverId = parsedServerId;
                }
                else {
                    throw new Error('No game or server provided');
                }

                const guilds = await this.__guild.getGuilds(whereArgs);
                res.status(200).json({guilds: guilds});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.__route.post<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            let { gameId, serverId } = req.params;
            const guild = req.body.guild;
            const parsedGameId = gameId ? parseInt(gameId) : guild.gameId;
            const parsedServerId = serverId ? parseInt(serverId) : guild.serverId;
            try {
                const guildResult = await this.__guild.createGuild(parsedGameId, parsedServerId, guild);
                res.status(201).json({guild: guildResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.__route.param('guildId', async (req, res, next, guildId)=> {
            try {
                const guilds = await this.__guild.getGuilds({ id: +guildId });
                if (guilds.length !== 1) {
                    throw new Error('Guild not found');
                }
                req.body.guildOriginal = guilds[0];
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const paramRoute = '/:guildId';
        this.__route.get<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, (req, res, _next) => {
            let { gameId, serverId } = req.params;
            const parsedGameId = gameId ? parseInt(gameId) : undefined;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;

            let guildOriginal: Partial<Guild> = req.body.guildOriginal;
            if (parsedGameId && parsedGameId !== guildOriginal.gameId) {
                console.error('Guild is not for this game');
                res.status(404);
                return;
            }
            else if (parsedServerId && parsedServerId !== guildOriginal.serverId) {
                console.error('Guild does not belong to this server');
                res.status(404);
                return;
            }
            if (!guildOriginal.active) {
                // do not give past basic information if inactive
                guildOriginal = {
                    id: guildOriginal.id,
                    name: guildOriginal.name,
                    active: guildOriginal.active
                };
            }
            res.status(200).json({guild: guildOriginal});
        });

        this.__route.put<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            let { gameId, serverId } = req.params;
            const parsedGameId = gameId ? parseInt(gameId) : undefined;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;

            const guild = req.body.guild;
            let guildOriginal: Guild = req.body.guildOriginal;
            if (parsedGameId && parsedGameId !== guildOriginal.gameId) {
                console.error('Guild is not for this game');
                res.status(400);
                return;
            }
            else if (parsedServerId && parsedServerId !== guildOriginal.serverId) {
                console.error('Guild does not belong to this server');
                res.status(400);
                return;
            }
            try {
                const guildResult = await this.__guild.updateGuild(guild, guildOriginal);
                res.status(202).json({guild: guildResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.__route.delete<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            let { gameId, serverId } = req.params;
            const parsedGameId = gameId ? parseInt(gameId) : undefined;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;

            const guildOriginal: Guild = req.body.guildOriginal;
            if (parsedGameId && parsedGameId !== guildOriginal.gameId) {
                console.error('Guild is not for this game');
                res.status(404);
                return;
            }
            else if (parsedServerId && parsedServerId !== guildOriginal.serverId) {
                console.error('Guild does not belong to this server');
                res.status(404);
                return;
            }
            try {
                await this.__guild.deactivateGuild(guildOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }
}

