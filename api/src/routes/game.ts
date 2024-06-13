import { RouterOptions } from "express";
import { PrismaClient, Game } from '@prisma/client'
import { GameModel } from "../classes/game";
import { GuildRoute } from "./guild";
import { Route } from "./route";

export class GameRoute extends Route<GameModel> {
    protected __model: GameModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new GameModel(prisma);
    }

    protected override __setUpRoute() {
        this.route.get('/', async (_req, res, _next) => {
            try {
                const games = await this.__model.get();
                res.status(200).json({games: games});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.param('gameId', async (req, res, next, gameId) => {
            try {
                const games = await this.__model.get({ id: +gameId });
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

        const guildRoute = new GuildRoute(this.__prisma, { mergeParams: true }).route;
        this.route.use('/:gameId/guilds', guildRoute);

        this.route.get('/:gameId',  (req, res, _next) => {
            let gameOriginal: Game = req.body.gameOriginal;
            res.status(200).json({game: gameOriginal});
        });
    }
}

