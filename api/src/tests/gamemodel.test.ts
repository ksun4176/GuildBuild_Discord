import { GameModel, messages  } from "../classes/gamemodel";
import { prismaMock } from './singleton'

describe('GameModel', () => {
    let gameModel: GameModel;
    beforeEach(() => {
        gameModel = new GameModel(prismaMock);
    });
    describe('gets games', () => {
        test('with filters provided will pass the filters as a condition', async () => {
            const filters = { id: 1 };
            await gameModel.get(filters);
            expect(prismaMock.game.findMany).toHaveBeenLastCalledWith({ where: filters });
        });
    });
    describe('create game', () => {
        test('with required data will create the game', async () => {
            const data = { name: "test" };
            await gameModel.create(data);
            expect(prismaMock.game.create).toHaveBeenLastCalledWith({ data: data });
        });
        test('with no name will error out', async () => {
            expect.assertions(1);
            const data = {};
            try {
                await gameModel.create(data);
            }
            catch (err) {
                expect(err).toEqual(new Error(messages.missingName));
            }
        });
    });
});