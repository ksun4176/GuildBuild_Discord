import { Server } from "@prisma/client";
import { messages, ServerFunctions } from "../classes/server";
import { prismaMock } from './singleton'

describe('ServerFunction', () => {
    let serverFunction: ServerFunctions;
    beforeEach(() => {
        serverFunction = new ServerFunctions(prismaMock);
    });
    describe('gets servers', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { active: true };
            await serverFunction.getServers(filters);
            expect(prismaMock.server.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create server', () => {
        test('with provided name will create the server', async () => {
            const data = { name: "test" };
            await serverFunction.createServer(data);
            expect(prismaMock.server.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const data = {};
            try {
                await serverFunction.createServer(data);
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
            const original: Server = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: true
            }
            await serverFunction.updateServer(data, original);
            expect(prismaMock.server.update).toHaveBeenLastCalledWith({ 
                where: { id: original.id },
                data: data 
            });
        });
        test('that is inactive will error out', async () => {
            expect.assertions(1);
            const data = { 
                name: "test",
                discordId: "discordId"
            };
            const original: Server = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: false
            }
            try {
                await serverFunction.updateServer(data, original);
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
            const original: Server = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: true
            }
            try {
                await serverFunction.updateServer(data, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchDiscordId));
            }
        });
    });
});