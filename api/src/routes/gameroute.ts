import { Game, Prisma, PrismaClient } from '@prisma/client'
import { GameModel } from "../classes/gamemodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";
import { GuildModel } from '../classes/guildmodel';
import { RouterOptions } from 'express';

type Params<T extends string> = Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export const messages = {
    gameIncomplete: 'The game object is missing properties',
    missingServer: 'Missing serverId',
    gameNotSupported: 'Server does not support game',
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
        this.route.get<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                const result = await this.__getGamesSummary(parsedServerId);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            try {
                const result = await this.__createGame(req.body.game);
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
            const { serverId } = req.params;
            const parsedServerId = serverId ? parseInt(serverId) : undefined;
            try {
                const result = await this.__getGameDetailed(req.body.gameOriginal, parsedServerId);
                res.status(200).json(result);
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
     * Get a list of games with only their basic details
     * @param serverId the server to see if a game is supported in
     * @returns List of games to show in a summary view
     */
    private async __getGamesSummary(serverId?: number) {
        const args: Prisma.GameFindManyArgs = {
            select: {
                id: true,
                name: true
            }
        }
        if (serverId) {
            // find all games supported on a server
            const guildArgs: Prisma.GuildFindManyArgs = {
                where: {
                    serverId: serverId,
                    active: true
                },
                select: {
                    gameId: true
                }
            }
            guildArgs.where = GuildModel.addPlaceholderCriteria(guildArgs.where!);
            const guilds = await this.__guildModel.findMany(guildArgs);
            const gameIds = guilds.map((guild) => guild.gameId);
            args.where = {
                id: { in: gameIds }
            }
        }
        return await this.__gameModel.findMany(args);
    }

    /**
     * Get the details on a single game
     * @param game game to get details about
     * @param serverId check if game is supported for this server and if so, get all the related guilds
     * @returns game detail and guilds if serverId is passed in
     */
    private async __getGameDetailed(game: Game, serverId?: number) {
        let guildIds;
        if (serverId) {
            const guildArgs: Prisma.GuildFindManyArgs = {
                where: {
                    serverId: serverId,
                    gameId: game.id,
                    active: true
                },
            }
            const guilds = await this.__guildModel.findMany(guildArgs);
            if (guilds.length === 0) {
                throw new Error(messages.gameNotSupported);
            }
            guildIds = guilds.filter((guild) => !GuildModel.isPlaceholderGuild(guild)).map((guild) => guild.id);
        }
        if (guildIds) {
            return { ...game, guilds: guildIds};
        }
        return game;
    }

    /**
     * Create a game
     * @param game The game property from the body of the POST request
     * @returns the created game
    */
    private async __createGame(game: any) {
        // check if required properties are set
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
    private async __addGameToServer(reqBody: any, serverId: number) {
        // add a game to the server
        const gameOriginal: Game = reqBody.gameOriginal;
        if (!gameOriginal) {
            throw new Error(messages.gameIncomplete);
        }
        return await this.__guildModel.createPlaceholderGuild(gameOriginal.id, serverId);
    }
}

