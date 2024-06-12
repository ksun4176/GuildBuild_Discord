import { messages, Server, ServerRoute } from "../routes/server";
import { prismaMock } from './singleton'

describe('ServerRoute', () => {
    let serverRoute: ServerRoute;
    beforeEach(() => {
        serverRoute = new ServerRoute(prismaMock);
    });
    describe('gets all servers', () => {
        test('that are active will add active as a condition', async () => {
            await serverRoute["__getAllServers"](true);
            expect(prismaMock.server.findMany).toHaveBeenLastCalledWith({ where: { active: true } });
        });
        test('default behavior will add no conditions', async () => {
            await serverRoute["__getAllServers"]();
            expect(prismaMock.server.findMany).toHaveBeenLastCalledWith({});
        });
    });
    describe('gets a single servers', () => {
        test('with an integer ID will add ID as a condition', async () => {
            const id = "1";
            await serverRoute["__getServerSingle"](id);
            expect(prismaMock.server.findFirstOrThrow).toHaveBeenLastCalledWith({ where: { id: parseInt(id) } });
        });
        test('default behavior will add no conditions', async () => {
            expect.assertions(1);
            const id = "badId";
            try {
                await serverRoute["__getServerSingle"](id);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.malformedId));
            }
        });
    });
    describe('create server', () => {
        test('with provided name will create the server', async () => {
            const data = { name: "test" };
            await serverRoute["__createServer"](data);
            expect(prismaMock.server.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const data = {};
            try {
                await serverRoute["__createServer"](data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingName));
            }
        });
    });
    describe('update a server', () => {
        test('that is active without changing the discord ID will update the server', async () => {
            const data = { 
                name: "test",
                discordId: "discordId"
            };
            const originalServer: Server = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: true
            }
            await serverRoute["__updateServer"](data, originalServer);
            expect(prismaMock.server.update).toHaveBeenLastCalledWith({ 
                where: { id: originalServer.id },
                data: data 
            });
        });
        test('that is inactive will error out', async () => {
            expect.assertions(1);
            const data = { 
                name: "test",
                discordId: "discordId"
            };
            const originalServer: Server = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: false
            }
            try {
                await serverRoute["__updateServer"](data, originalServer);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.notActive));
            }
        });
        test('to overwrite discordId will error out', async () => {
            expect.assertions(1);
            const data = { 
                name: "test",
                discordId: "discordIdNew"
            };
            const originalServer: Server = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: true
            }
            try {
                await serverRoute["__updateServer"](data, originalServer);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchDiscordId));
            }
        });
    });
});