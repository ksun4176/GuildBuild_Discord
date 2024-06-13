import { GameModel  } from "../classes/gamemodel";
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
});