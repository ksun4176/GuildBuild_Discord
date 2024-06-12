import { messages, GameFunctions } from "../classes/game";
import { prismaMock } from './singleton'

describe('GameFunction', () => {
    let gameFunction: GameFunctions;
    beforeEach(() => {
        gameFunction = new GameFunctions(prismaMock);
    });
    describe('gets games', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { id: 1 };
            await gameFunction.getGames(filters);
            expect(prismaMock.game.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create game', () => {
        test('with provided name will create the game', async () => {
            const data = { name: "test" };
            await gameFunction.createGame(data);
            expect(prismaMock.game.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const data = {};
            try {
                await gameFunction.createGame(data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingName));
            }
        });
    });
});