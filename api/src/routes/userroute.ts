import { RouterOptions } from "express";
import { Prisma, PrismaClient, User } from '@prisma/client'
import { UserModel } from "../classes/usermodel";
import { Route } from "./route";

export const messages = {
    userIncomplete: 'The user object is missing properties',
}

export class UserRoute extends Route {
    protected __userModel: UserModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__userModel = new UserModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (_req, res, _next) => {
            // TODO
            // const serverId = req.query.serverId;
            // const gameId = req.query.gameId;
            // const guildId = req.query.guildId;
            try {
                const users = await this.__userModel.findMany({
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
            try {
                const result = await this.__createUser(req.body.user);
                res.status(201).json(result);
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
                const users = await this.__userModel.findOne(args);
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
                const userResult = await this.__userModel.update(args, userOriginal);
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
                await this.__userModel.delete(userOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }

    /**
     * Create a user
     * @param user The user property from the body of the POST request
     * @returns the created user
    */
    private async __createUser(user: any): Promise<User> {
        // check if required properties are set
        if (!user || !user.name) {
            throw new Error(messages.userIncomplete);
        }
        const userResult = await this.__userModel.create({ data: user });
        return userResult;
    }
}

