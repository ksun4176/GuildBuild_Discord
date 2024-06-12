import { Guild, Prisma } from "@prisma/client";
import { messages, GuildFunctions } from "../classes/guild";
import { prismaMock } from './singleton'

describe('GuildFunction', () => {
    let guildFunction: GuildFunctions;
    beforeEach(() => {
        guildFunction = new GuildFunctions(prismaMock);
    });
    describe('gets guilds', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { active: true };
            await guildFunction.getGuilds(filters);
            expect(prismaMock.guild.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create guild', () => {
        test('with required data will create the guild', async () => {
            const serverId = 1;
            const gameId = 2;
            const data = { 
                guildId: "guildId",
                name: "test" 
            };

            let expectedData: Partial<Prisma.GuildUncheckedCreateInput> = data;
            expectedData.serverId = serverId;
            expectedData.gameId = gameId;

            await guildFunction.createGuild(gameId, serverId, data);
            expect(prismaMock.guild.create).toHaveBeenLastCalledWith({ data: expectedData });
        });
        test('with no gameId will error out', async () => {
            expect.assertions(1);
            const serverId = 1;
            const data = { 
                guildId: "guildId",
                name: "test" 
            };
            try {
                await guildFunction.createGuild(undefined as any, serverId, data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingGame));
            }
        });
        test('with no serverId will error out', async () => {
            expect.assertions(1);
            const gameId = 2;
            const data = { 
                guildId: "guildId",
                name: "test" 
            };
            try {
                await guildFunction.createGuild(gameId, undefined as any, data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingServer));
            }
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const serverId = 1;
            const gameId = 2;
            const data = { 
                guildId: "guildId",
            };
            try {
                await guildFunction.createGuild(serverId, gameId, data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingName));
            }
        });
        test('with no guildId will error out', async () => {
            expect.assertions(1);
            const serverId = 1;
            const gameId = 2;
            const data = { 
                name: "test" 
            };
            try {
                await guildFunction.createGuild(serverId, gameId, data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingGuildId));
            }
        });
    });
    describe('update a guild', () => {
        test('that is active without changing the game ID or guild ID will update the guild', async () => {
            const data = { 
                gameId: 1,
                guildId: "guildId",
                name: "test",
                serverId: 2
            };
            const original: Guild = {
                id: 1,
                gameId: 1,
                guildId: "guildId",
                name: "testnew",
                serverId: 3,
                active: true
            }
            await guildFunction.updateGuild(data, original);
            expect(prismaMock.guild.update).toHaveBeenLastCalledWith({ 
                where: { id: original.id },
                data: data 
            });
        });
        test('that is inactive will error out', async () => {
            expect.assertions(1);
            const data = { 
                gameId: 1,
                guildId: "guildId",
                name: "test",
                serverId: 2
            };
            const original: Guild = {
                id: 1,
                gameId: 1,
                guildId: "guildId",
                name: "testnew",
                serverId: 3,
                active: false
            }
            try {
                await guildFunction.updateGuild(data, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.notActive));
            }
        });
        test('to overwrite gameId will error out', async () => {
            expect.assertions(1);
            const data = { 
                gameId: 1,
                guildId: "guildId",
                name: "test",
                serverId: 2
            };
            const original: Guild = {
                id: 1,
                gameId: 4,
                guildId: "guildId",
                name: "testnew",
                serverId: 3,
                active: true
            }
            try {
                await guildFunction.updateGuild(data, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchGame));
            }
        });
        test('to overwrite guildId will error out', async () => {
            expect.assertions(1);
            const data = { 
                gameId: 1,
                guildId: "guildId",
                name: "test",
                serverId: 2
            };
            const original: Guild = {
                id: 1,
                gameId: 1,
                guildId: "guildIdNew",
                name: "testnew",
                serverId: 3,
                active: true
            }
            try {
                await guildFunction.updateGuild(data, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchGuild));
            }
        });
    });
});