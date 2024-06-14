import { Game, Prisma, PrismaClient } from '@prisma/client'
import { GameModel } from "../classes/gamemodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";
import { GuildModel } from '../classes/guildmodel';
import { RouterOptions } from 'express';

type Params<T extends string> = Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export class GameRoute extends Route<GameModel> {
    protected __model: GameModel;

    private __guildModel: GuildModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new GameModel(prisma);
        this.__guildModel = new GuildModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (_req, res, _next) => {
            // get all games
            try {
                const games = await this.__model.findMany();
                res.status(200).json({games: games});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            // add a new game
            const game = req.body.game;
            try {
                const gameResult = await this.__model.create({ data: game });
                res.status(201).json({game: gameResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('gameId', async (req, res, next, gameId) => {
            try {
                const parsedGameId = parseInt(gameId);
                const args: Prisma.GameFindUniqueOrThrowArgs = { where: { id: parsedGameId } };
                const game = await this.__model.findOne(args);
                req.body.gameOriginal = game;
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const paramRoute = '/:gameId';
        this.route.get<typeof paramRoute,Params<typeof paramRoute>>(paramRoute,  async (req, res, _next) => {
            // get a single game
            let gameOriginal: Game = req.body.gameOriginal;
            
            // check if supported by server
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (parsedServerId) {
                    const guildArgs: Prisma.GuildFindManyArgs = {
                        where: {
                            serverId: parsedServerId,
                            gameId: gameOriginal.id
                        }
                    }
                    const guilds = await this.__guildModel.findMany(guildArgs);
                    if (guilds.length === 0) {
                        throw new Error('Server does not support game');
                    }
                }
                res.status(200).json({game: gameOriginal});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        this.route.put<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            // add a game to the server
            let gameOriginal: Game = req.body.gameOriginal;
            
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error('Missing server object');
                }
                this.__guildModel.createPlaceholderGuild(gameOriginal.id, parsedServerId);
                res.status(202).json({game: gameOriginal});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        

    }
}

