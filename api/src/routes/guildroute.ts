import { RouterOptions } from 'express';
import { Guild, Prisma, PrismaClient } from '@prisma/client'
import { GuildModel } from "../classes/guildmodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";

type Params<T extends string> = Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export class GuildRoute extends Route {
    protected __model: GuildModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new GuildModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error('No server provided');
                }
                const args: Prisma.GuildFindManyArgs = { 
                    where: {
                         active: true,
                         serverId: parsedServerId
                    }
                };
                args.where = GuildModel.addPlaceholderCriteria(args.where!, true);
                // look for gameId query
                const queryGameId = req.query.gameId;
                if (typeof queryGameId === "string") {
                    args.where!.gameId = parseInt(queryGameId);
                }
                const guilds = await this.__model.findMany(args);
                res.status(200).json({ guilds: guilds });
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            const guild = req.body.guild;
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error('No server provided');
                }
                let existingGuildsArgs: Prisma.GuildFindManyArgs = {
                    where: { 
                        serverId: parsedServerId,
                        gameId: guild.gameId
                    }
                }
                existingGuildsArgs.where = GuildModel.addPlaceholderCriteria(existingGuildsArgs.where!);
                const existingGuilds = await this.__model.findMany(existingGuildsArgs);
                if (existingGuilds.length === 0) {
                    // game has not been set up on server
                    throw new Error('Server does not support game');
                }
                guild.serverId = parsedServerId;
                const guildResult = await this.__model.create({ data: guild });
                res.status(201).json({guild: guildResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('guildId', async (req, res, next, guildId)=> {
            try {
                const parsedGuildId = parseInt(guildId);
                const args: Prisma.GuildFindUniqueOrThrowArgs = { where: { id: parsedGuildId } };
                const guild = await this.__model.findOne(args);
                req.body.guildOriginal = guild;
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const paramRoute = '/:guildId';
        this.route.get<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, (req, res, _next) => {
            let guildOriginal: Partial<Guild> = req.body.guildOriginal;
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error('No server provided');
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
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        this.route.put<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            let guildOriginal: Guild = req.body.guildOriginal;
            const guild = req.body.guild;
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error('No server provided');
                }
                const guildResult = await this.__model.update(guild, guildOriginal);
                res.status(202).json({guild: guildResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.delete<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            let guildOriginal: Guild = req.body.guildOriginal;
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error('No server provided');
                }
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

