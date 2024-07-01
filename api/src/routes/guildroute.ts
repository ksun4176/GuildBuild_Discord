import { RouterOptions } from 'express';
import { Guild, Prisma, PrismaClient, UserRole } from '@prisma/client'
import { GuildModel } from "../classes/guildmodel";
import { RouteParameters } from 'express-serve-static-core';
import { Route } from "./route";
import { RoleType, UserRoleModel } from '../classes/userrolemodel';

type Params<T extends string> = Partial<RouteParameters<':serverId'>> & RouteParameters<T>;

export const messages = {
    guildIncomplete: 'The guild object is missing properties',
    missingServer: 'Missing serverId',
    gameNotSupported: 'Server does not support game',
}

export class GuildRoute extends Route {
    private __guildModel: GuildModel;
    private __userRoleModel: UserRoleModel;

    constructor(prisma: PrismaClient, routerOptions?: RouterOptions) {
        super(prisma, routerOptions);
        this.__guildModel = new GuildModel(prisma);
        this.__userRoleModel = new UserRoleModel(prisma);
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
                const guilds = await this.__guildModel.findMany(args);
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
                    throw new Error(messages.missingServer);
                }
                
                guild.serverId = parsedServerId;
                const result = await this.__createGuild(guild);
                res.status(201).json(result);
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
                const guild = await this.__guildModel.findOne(args);
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
                const guildResult = await this.__guildModel.update(guild, guildOriginal);
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
                await this.__guildModel.delete(guildOriginal);
                res.sendStatus(204);
            }
            catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    }

    /**
     * Create a guild and assign the lead + management roles
     * @param guild The guild from the body of the POST request
     * @returns the created server and linked owner
     */
    private async __createGuild(guild: any): Promise<Guild> {
        // check if required properties are set
        if (!guild || !guild.serverId || !guild.gameId || !guild.guildId || !guild.name) {
            throw new Error(messages.guildIncomplete);
        }

        // check if game is supported on the server
        if (!this.__guildModel.hasPlaceholderGuild(guild.serverId, guild.gameId)) {
            throw new Error(messages.gameNotSupported);
        }

        // create the guild -> guild lead role -> management role -> member role
        const guildResult = await this.__guildModel.create({ data: guild });
        const leadRole = this.__getRoleFromType(guildResult, RoleType.GuildLead, guild.leadRole);
        await this.__userRoleModel.create({ data: leadRole });
        const managementRole = this.__getRoleFromType(guildResult, RoleType.GuildManagement, guild.managementRole);
        await this.__userRoleModel.create({ data: managementRole });
        const memberRole = this.__getRoleFromType(guildResult, RoleType.GuildMember, guild.memberRole);
        await this.__userRoleModel.create({ data: memberRole });

        return guildResult;
    }

    /**
     * Get the UserRole object based on type and guild properties
     * @param guild Guild the role belongs to
     * @param roleType The role type to add
     * @param reqRole role information from HTTP request
     * @returns role to add
     */
    private __getRoleFromType(guild: Guild, roleType: RoleType, reqRole?: any): UserRole {
        let suffix = '';
        switch (roleType) {
            case RoleType.GuildLead:
                suffix = 'Lead';
                break;
            case RoleType.GuildManagement:
                suffix = 'Management';
                break;
            case RoleType.GuildMember:
                suffix = 'Member';
                break;
        }
        if (suffix) {
            suffix = ' ' + suffix;
        }

        const role: UserRole = reqRole ?? {};
        role.name = role.name ?? `${guild.name}${suffix}`;
        role.roleType = roleType;
        role.serverId = guild.serverId;
        role.guildId = guild.id;

        return role;
    }
}

