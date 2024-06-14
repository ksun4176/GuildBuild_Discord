import { User } from "@prisma/client";
import { messages, UserModel } from "../classes/usermodel";
import { prismaMock } from './singleton'

describe('UserModel', () => {
    let userModel: UserModel;
    beforeEach(() => {
        userModel = new UserModel(prismaMock);
    });
    describe('gets user', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { active: true } };
            await userModel.findMany(args);
            expect(prismaMock.user.findMany).toHaveBeenLastCalledWith(args);
        });
    });
    describe('gets one user', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { id: 1 } };
            await userModel.findOne(args);
            expect(prismaMock.user.findUniqueOrThrow).toHaveBeenLastCalledWith(args);
        });
    });
    describe('create user', () => {
        test('with data will create the user', async () => {
            const args = { data: { name: "test" } };
            await userModel.create(args);
            expect(prismaMock.user.create).toHaveBeenLastCalledWith(args);
        });
    });
    describe('update a user', () => {
        test('that is active by changing the name will update the user', async () => {
            const id = 1;
            const args = {
                where: { id: id },
                data: { name: "new" }
            }
            const original: User = {
                id: id,
                name: "original",
                discordId: "discordId",
                active: true
            }
            await userModel.update(args, original);
            expect(prismaMock.user.update).toHaveBeenLastCalledWith(args);
        });
        test('that is inactive will error out', async () => {
            expect.assertions(1);
            const id = 1;
            const args = {
                where: { id: id },
                data: { name: "new" }
            }
            const original: User = {
                id: id,
                name: "original",
                discordId: "discordId",
                active: false
            }
            try {
                await userModel.update(args, original);
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
            }
            const original: User = {
                id: id,
                name: "original",
                discordId: "discordId",
                active: true
            }
            try {
                await userModel.update(args, original);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.mismatchDiscordId));
            }
        });
    });
});