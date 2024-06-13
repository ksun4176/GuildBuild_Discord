import { RouterOptions } from "express";
import { PrismaClient, User } from '@prisma/client'
import { UserModel } from "../classes/usermodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";

type Params<T extends string> = Partial<RouteParameters<':serverId'>> & Partial<RouteParameters<':guildId'>> & RouteParameters<T>;

export class UserRoute extends Route<UserModel> {
    protected __model: UserModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new UserModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        // TODO:
        // this.route.get<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
        //     let { serverId, guildId } = req.params;
        //     let parsedGuildId = guildId ? parseInt(guildId) : undefined;
        //     let parsedServerId = serverId ? parseInt(serverId) : undefined;
        // });

        this.route.post<typeof rootRoute,Params<typeof rootRoute>>(rootRoute, async (req, res, _next) => {
            try {
                const user = req.body.user;
                const userResult = await this.__model.create(user);
                res.status(201).json({user: userResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('userId', async (req, res, next, userId)=> {
            try {
                const users = await this.__model.get({ id: +userId });
                if (users.length !== 1) {
                    throw new Error('User not found');
                }
                req.body.userOriginal = users[0];
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const paramRoute = '/:userId';
        this.route.get<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, (req, res, _next) => {
            // TODO:
            // let { serverId, guildId } = req.params;
            // let parsedGuildId = guildId ? parseInt(guildId) : undefined;
            // let parsedServerId = serverId ? parseInt(serverId) : undefined;

            let userOriginal: Partial<User> = req.body.userOriginal;
            if (!userOriginal.active) {
                // do not give past basic information if inactive
                userOriginal = {
                    id: userOriginal.id,
                    name: userOriginal.name,
                    active: userOriginal.active
                };
            }
            res.status(200).json({user: userOriginal});
        });

        this.route.put<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            // TODO:
            // let { serverId, guildId } = req.params;
            // let parsedGuildId = guildId ? parseInt(guildId) : undefined;
            // let parsedServerId = serverId ? parseInt(serverId) : undefined;

            const user = req.body.user;
            let userOriginal: User = req.body.userOriginal;
            try {
                const userResult = await this.__model.update(user, userOriginal);
                res.status(202).json({user: userResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.delete<typeof paramRoute,Params<typeof paramRoute>>(paramRoute, async (req, res, _next) => {
            // TODO:
            // let { serverId, guildId } = req.params;
            // let parsedGuildId = guildId ? parseInt(guildId) : undefined;
            // let parsedServerId = serverId ? parseInt(serverId) : undefined;

            const userOriginal: User = req.body.userOriginal;
            try {
                await this.__model.delete(userOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }
}

