import { Game, Guild, Prisma, PrismaClient } from '@prisma/client'
import { GameModel } from "../classes/gamemodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";
import { GuildModel } from '../classes/guildmodel';
import { RouterOptions } from 'express';

type Params<T extends string> = Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export const messages = {
    gameIncomplete: 'The game object is missing properties',
    missingServer: 'Missing serverId',
}

export class GameRoute extends Route {
    private __gameModel: GameModel;
    private __guildModel: GuildModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__gameModel = new GameModel(prisma);
        this.__guildModel = new GuildModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (_req, res, _next) => {
            // get all games
            try {
                const games = await this.__gameModel.findMany();
                res.status(200).json({games: games});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            try {
                const result = await this.__createGame(req.body);
                res.status(201).json(result);
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
                const game = await this.__gameModel.findOne(args);
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

        this.route.post<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                if (!parsedServerId) {
                    throw new Error(messages.missingServer);
                }
                const result = await this.__addGameToServer(req.body, parsedServerId);
                res.status(201).json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });
    }

    /**
     * Create a game
     * @param reqBody The body from the POST request
     * @returns the created game
    */
    private async __createGame(reqBody: any): Promise<Game> {
        // check if required properties are set
        const game = reqBody.game;
        if (!game || !game.name) {
            throw new Error(messages.gameIncomplete);
        }
        const gameResult = await this.__gameModel.create({ data: game });
        return gameResult;
    }

    /**
     * Add a game to a server to be handled
     * @param reqBody The body from the POST request
     * @param serverId the server to add game to
     * @returns the created placeholder guild
     */
    private async __addGameToServer(reqBody: any, serverId: number): Promise<Guild> {
        // add a game to the server
        const gameOriginal: Game = reqBody.gameOriginal;
        if (!gameOriginal) {
            throw new Error(messages.gameIncomplete);
        }
        return await this.__guildModel.createPlaceholderGuild(gameOriginal.id, serverId);
    }
}

