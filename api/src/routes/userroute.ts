import { RouterOptions } from "express";
import { Prisma, PrismaClient, User } from '@prisma/client'
import { UserModel } from "../classes/usermodel";
import { Route } from "./route";
import { UserRoleModel } from "../classes/userrolemodel";

// Include:
// - roles details -> linked guilds -> linked games
const userInclude = Prisma.validator<Prisma.UserInclude>()({
    roles: {
        include: { role: {
            include: { guild: { select: { gameId: true } } }
        } }
    }
});
type UserDetailed = Prisma.UserGetPayload<{
    include: typeof userInclude
}>;

export const messages = {
    userIncomplete: 'The user object is missing properties',
}

export class UserRoute extends Route {
    private __userModel: UserModel;
    private __userRoleModel: UserRoleModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__userModel = new UserModel(prisma);
        this.__userRoleModel = new UserRoleModel(prisma);
    }

    protected override __setUpRoute() {
        const rootRoute = '/';
        this.route.get(rootRoute, async (req, res, _next) => {
            const { serverId, guildId, discordId }  = req.query;
            const parsedServerId = typeof serverId === "string" ? parseInt(serverId) : undefined;
            const parsedGuildId = typeof guildId === "string" ? parseInt(guildId) : undefined;
            const parsedDiscordId = typeof discordId === "string" ? discordId : undefined;
            try {
                const result = await this.__getUsersSummary(parsedServerId, parsedGuildId, parsedDiscordId);
                res.status(200).json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });

        this.route.post(rootRoute, async (req, res, _next) => {
            try {
                const result = await this.__createUser(req.body.user);
                console.log('User added: ', result);
                res.status(201).json(result);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(400);
            }
        });

        this.route.param('userId', async (req, res, next, userId)=> {
            try {
                const parsedUserId = parseInt(userId);
                const users = await this.__userModel.findOne({
                    where: { id: parsedUserId },
                    include: userInclude
                });
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
            const result = this.__getUserDetailed(req.body.userOriginal);
            res.status(200).json(result);
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
     * Get a list of users with only their basic details
     * @param serverId server to find users in it
     * @param guildId guild to find users in it
     * @param discordId discord ID of user to find
     * @returns List of users to show in a summary view
     */
    private async __getUsersSummary(serverId?: number, guildId?: number, discordId?: string) {
        let users = await this.__userModel.findMany({
            where: { active: true },
        });

        if (discordId) {
            users = users.filter((user) => user.discordId === discordId);
        }
        else if (serverId || guildId) {
            const userRoleInclude = Prisma.validator<Prisma.UserRoleInclude>()({ users: true });
            type RoleDetailed = Prisma.UserRoleGetPayload<{ include: typeof userRoleInclude }>;
            const roles: Partial<RoleDetailed>[] = await this.__userRoleModel.findMany({
                where: {
                    serverId: serverId,
                    guildId: guildId
                },
                include: userRoleInclude
            });
            const validUsers = roles.flatMap((role) => role.users).map((tempUser) => tempUser!.userId);
            users = users.filter((user) => validUsers.includes(user.id));
        }

        return users;
    }

    // /**
    //  * Get the details on a single user
    //  * @param user user to get details about
    //  * @returns user detail
    //  */
    private __getUserDetailed(user: UserDetailed) {
        if (!user.active) {
            // do not give past basic information if inactive
            return {
                id: user.id,
                name: user.name,
                discordId: user.discordId,
                active: user.active
            };
        }

        const roles = user.roles.map((role) => role.roleId);
        let guilds = user.roles.map((role) => role.role.guildId).filter((id) => typeof id === "number");
        guilds = [...new Set(guilds)];
        let games = user.roles.map((role) => role.role.guild?.gameId).filter((id) => typeof id === "number");
        games = [...new Set(games)];

        return {
            id: user.id,
            name: user.name,
            discordId: user.discordId,
            active: user.active,
            roles: roles,
            guilds: guilds,
            games: games
        };
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

