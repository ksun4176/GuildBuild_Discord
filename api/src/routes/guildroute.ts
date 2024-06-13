import { RouterOptions } from "express";
import { Guild, Prisma, PrismaClient } from '@prisma/client'
import { GuildModel } from "../classes/guildmodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";

type Params<T extends string> = Partial<RouteParameters<':gameId'>> & Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export class GuildRoute extends Route<GuildModel> {
    protected __model: GuildModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new GuildModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            let { gameId, serverId } = req.params;
            let parsedGameId = gameId ? parseInt(gameId) : undefined;
            let parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                const whereArgs: Partial<Prisma.GuildWhereInput> = {
                    active: true
                };
                if (parsedGameId) {
                    whereArgs.gameId = parsedGameId;
                }
                else if (parsedServerId) {
                    whereArgs.serverId = parsedServerId;
                    // look for gameId query
                    const queryGameId = req.query.gameId;
                    if (typeof queryGameId === "string") {
                        whereArgs.gameId = parseInt(queryGameId);
                    }
                }
                else {
                    throw new Error('No game or server provided');
                }

                const guilds = await this.__model.get(whereArgs);
                res.status(200).json({guilds: guilds});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            let { gameId, serverId } = req.params;
            const guild = req.body.guild;
            const parsedGameId = gameId ? parseInt(gameId) : guild.gameId;
            const parsedServerId = serverId ? parseInt(serverId) : guild.serverId;
            if (parsedGameId) {
                guild.gameId = parsedGameId;
            }
            if (parsedServerId) {
                guild.serverId = parsedServerId;
            }
            try {
                const guildResult = await this.__model.create(guild);
                res.status(201).json({guild: guildResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('guildId', async (req, res, next, guildId)=> {
            try {
                const guilds = await this.__model.get({ id: +guildId });
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
        this.route.get<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, (req, res, _next) => {
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

        this.route.put<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
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
                const guildResult = await this.__model.update(guild, guildOriginal);
                res.status(202).json({guild: guildResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.delete<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
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
                await this.__model.delete(guildOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }
}

