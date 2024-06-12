import { Router } from "express";
import { PrismaClient, Game } from '@prisma/client'
import { GameFunctions } from "../classes/game";
import { GuildRoute } from "./guild";

export class GameRoute {
    /**
     * The prisma client that connects to the database
     */ 
    private __prisma: PrismaClient;
    private __game: GameFunctions;
    /** The router */
    private __route: Router;
    public get route(): Router {
        return this.__route;
    }

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
        this.__game = new GameFunctions(this.__prisma);
        this.__route = Router();
        this.__setUpRoute();
    }

    /**
     * Set up all routes
     */
    private __setUpRoute() {
        
        this.__route.get('/', async (_req, res, _next) => {
            try {
                const games = await this.__game.getGames();
                res.status(200).json({games: games});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.__route.param('gameId', async (req, res, next, gameId) => {
            try {
                const games = await this.__game.getGames({ id: +gameId });
                if (games.length !== 1) {
                    throw new Error('Game not found');
                }
                req.body.gameOriginal = games[0];
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const guildRoute = new GuildRoute(this.__prisma).route;
        this.__route.use('/:gameId/guilds', guildRoute);

        this.__route.get('/:gameId',  (req, res, _next) => {
            let gameOriginal: Game = req.body.gameOriginal;
            res.status(200).json({game: gameOriginal});
        });
    }
}

