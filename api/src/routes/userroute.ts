import { RouterOptions } from "express";
import { Prisma, PrismaClient, User } from '@prisma/client'
import { UserModel } from "../classes/usermodel";
import { Route } from "./route";

export class UserRoute extends Route<UserModel> {
    protected __model: UserModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__model = new UserModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (_req, res, _next) => {
            // TODO
            // const serverId = req.query.serverId;
            // const gameId = req.query.gameId;
            // const guildId = req.query.guildId;
            try {
                const users = await this.__model.findMany({
                    where: { active: true }
                });
                res.status(200).json({users: users});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            const user = req.body.user;
            try {
                const userResult = await this.__model.create({ data: user });
                res.status(201).json({user: userResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('userId', async (req, res, next, userId)=> {
            const parsedUserId = parseInt(userId);
            const args: Prisma.UserFindUniqueOrThrowArgs = {
                where: {
                    id: parsedUserId
                },
                include: {
                    applications: true
                }
            };
            try {
                const users = await this.__model.findOne(args);
                req.body.userOriginal = users;
                next();
            }
            catch (err) {
                console.error(err);
                res.sendStatus(404);
            }
        });

        const paramRoute = '/:userId';
        this.route.get(paramRoute, (req, res, _next) => {
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

        this.route.put(paramRoute, async (req, res, _next) => {
            const user = req.body.user;
            let userOriginal: User = req.body.userOriginal;
            try {
                const args: Prisma.UserUpdateArgs = {
                    where: { id: userOriginal.id },
                    data: user
                }
                const userResult = await this.__model.update(args, userOriginal);
                res.status(202).json({user: userResult});
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.delete(paramRoute, async (req, res, _next) => {
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

