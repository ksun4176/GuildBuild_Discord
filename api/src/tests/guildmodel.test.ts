import { Guild } from "@prisma/client";
import { GuildModel, messages } from "../classes/guildmodel";
import { prismaMock } from './singleton'

describe('GuildModel', () => {
    let guildModel: GuildModel;
    beforeEach(() => {
        guildModel = new GuildModel(prismaMock);
    });
    describe('gets guilds', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { active: true } };
            await guildModel.findMany(args);
            expect(prismaMock.guild.findMany).toHaveBeenLastCalledWith(args);
        });
    });
    describe('gets one guild', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { id: 1 } };
            await guildModel.findOne(args);
            expect(prismaMock.guild.findUniqueOrThrow).toHaveBeenLastCalledWith(args);
        });
    });
    describe('create guild', () => {
        test('with data will create the guild', async () => {
            const args = { 
                data: { 
                    guildId: "guildId",
                    name: "test",
                    serverId: 1,
                    gameId: 2
                }
            };
            await guildModel.create(args);
            expect(prismaMock.guild.create).toHaveBeenLastCalledWith(args);
        });
    });
    describe('update a guild', () => {
        test('that is active by changing the name will update the guild', async () => {
            const id = 1;
            const args = {
                where: { id: id },
                data: { name: "new" }
            };
            const original: Guild = {
                id: id,
                gameId: 2,
                guildId: "guildId",
                name: "test",
                serverId: 3,
                active: true
            }
            await guildModel.update(args, original);
            expect(prismaMock.guild.update).toHaveBeenLastCalledWith(args);
        });
        test('that is inactive will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { name: "new" }
            };
            const original: Guild = {
                id: id,
                gameId: 2,
                guildId: "guildId",
                name: "test",
                serverId: 3,
                active: false
            }
            try {
                await guildModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.notActive));
            }
        });
        test('to overwrite gameId will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { gameId: 4 }
            };
            const original: Guild = {
                id: id,
                gameId: 2,
                guildId: "guildId",
                name: "test",
                serverId: 3,
                active: true
            }
            try {
                await guildModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchGame));
            }
        });
        test('to overwrite guildId will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { guildId: "new" }
            };
            const original: Guild = {
                id: id,
                gameId: 2,
                guildId: "guildId",
                name: "test",
                serverId: 3,
                active: true
            }
            try {
                await guildModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchGuild));
            }
        });
        test('to overwrite serverId will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { serverId: 4 }
            };
            const original: Guild = {
                id: id,
                gameId: 2,
                guildId: "guildId",
                name: "test",
                serverId: 3,
                active: true
            }
            try {
                await guildModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchServer));
            }
        });
    });

    // TODO write unit tests for isPlaceholderGuild, createPlaceholderGuild
});