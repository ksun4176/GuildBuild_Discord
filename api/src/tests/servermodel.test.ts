import { Server } from "@prisma/client";
import { messages, ServerModel } from "../classes/servermodel";
import { prismaMock } from './singleton'

describe('ServerModel', () => {
    let serverModel: ServerModel;
    beforeEach(() => {
        serverModel = new ServerModel(prismaMock);
    });
    describe('gets servers', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { active: true } };
            await serverModel.findMany(args);
            expect(prismaMock.server.findMany).toHaveBeenLastCalledWith(args);
        });
    });
    describe('gets one server', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { id: 1 } };
            await serverModel.findOne(args);
            expect(prismaMock.server.findUniqueOrThrow).toHaveBeenLastCalledWith(args);
        });
    });
    describe('create server', () => {
        test('with data will create the server', async () => {
            const args = { data: { name: "test" } };
            await serverModel.create(args);
            expect(prismaMock.server.create).toHaveBeenLastCalledWith(args);
        });
    });
    describe('update a server', () => {
        test('that is active by changing the name will update the server', async () => {
            const id = 1;
            const args = {
                where: { id: id },
                data: { name: "new" }
            };
            const original: Server = {
                id: id,
                name: "original",
                discordId: "discordId",
                active: true
            }
            await serverModel.update(args, original);
            expect(prismaMock.server.update).toHaveBeenLastCalledWith(args);
        });
        test('that is inactive will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { name: "new" }
            };
            const original: Server = {
                id: id,
                name: "original",
                discordId: "discordId",
                active: false
            }
            try {
                await serverModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.notActive));
            }
        });
        test('to overwrite discordId will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { discordId: "new" }
            };
            const original: Server = {
                id: id,
                name: "original",
                discordId: "discordId",
                active: true
            }
            try {
                await serverModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchDiscordId));
            }
        });
    });
});