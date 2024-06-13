import { messages, GameModel } from "../classes/game";
import { prismaMock } from './singleton'

describe('GameFunction', () => {
    let gameFunction: GameModel;
    beforeEach(() => {
        gameFunction = new GameModel(prismaMock);
    });
    describe('gets games', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { id: 1 };
            await gameFunction.get(filters);
            expect(prismaMock.game.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create game', () => {
        test('with provided name will create the game', async () => {
            const data = { name: "test" };
            await gameFunction.create(data);
            expect(prismaMock.game.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const data = {};
            try {
                await gameFunction.create(data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingName));
            }
        });
    });
});