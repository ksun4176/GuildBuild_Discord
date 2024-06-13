import { User } from "@prisma/client";
import { messages, UserModel } from "../classes/usermodel";
import { prismaMock } from './singleton'

describe('UserModel', () => {
    let userModel: UserModel;
    beforeEach(() => {
        userModel = new UserModel(prismaMock);
    });
    describe('gets users', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { active: true };
            await userModel.get(filters);
            expect(prismaMock.user.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create user', () => {
        test('with required data will create the user', async () => {
            const data = {
                name: "test",
            };

            await userModel.create(data);
            expect(prismaMock.user.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no data', async () => {
            expect.assertions(1);
            try {
                await userModel.create(undefined as any);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingObject));
            }
        });
    });
    describe('update a user', () => {
        test('that is active without changing the discord ID will update the user', async () => {
            const data = { 
                name: "test",
                discordId: "discordId"
            };
            const original: User = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: true
            }
            await userModel.update(data, original);
            expect(prismaMock.user.update).toHaveBeenLastCalledWith({ 
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
            const original: User = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: false
            }
            try {
                await userModel.update(data, original);
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
            const original: User = {
                id: 1,
                name: "original",
                discordId: "discordId",
                active: true
            }
            try {
                await userModel.update(data, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchDiscordId));
            }
        });
    });
});