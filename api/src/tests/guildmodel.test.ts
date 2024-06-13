import { Guild } from "@prisma/client";
import { GuildModel, messages } from "../classes/guildmodel";
import { prismaMock } from './singleton'

describe('GuildModel', () => {
    let guildModel: GuildModel;
    beforeEach(() => {
        guildModel = new GuildModel(prismaMock);
    });
    describe('gets guilds', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { active: true };
            await guildModel.get(filters);
            expect(prismaMock.guild.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create guild', () => {
        test('with required data will create the guild', async () => {
            const data = { 
                guildId: "guildId",
                name: "test",
                serverId: 1,
                gameId: 2
            };

            await guildModel.create(data);
            expect(prismaMock.guild.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no gameId will error out', async () => {
            expect.assertions(1);
            const data = { 
                serverId: 1,
                guildId: "guildId",
                name: "test" 
            };
            try {
                await guildModel.create(data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingGame));
            }
        });
        test('with no serverId will error out', async () => {
            expect.assertions(1);
            const data = { 
                gameId: 2,
                guildId: "guildId",
                name: "test" 
            };
            try {
                await guildModel.create(data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingServer));
            }
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const data = { 
                serverId: 1,
                gameId: 2,
                guildId: "guildId",
            };
            try {
                await guildModel.create(data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingName));
            }
        });
        test('with no guildId will error out', async () => {
            expect.assertions(1);
            const data = { 
                serverId: 1,
                gameId: 2,
                name: "test" 
            };
            try {
                await guildModel.create(data);
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
            await guildModel.update(data, original);
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
                await guildModel.update(data, original);
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
                await guildModel.update(data, original);
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
                await guildModel.update(data, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchGuild));
            }
        });
    });
});