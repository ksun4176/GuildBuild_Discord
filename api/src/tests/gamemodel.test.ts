import { GameModel  } from "../classes/gamemodel";
import { prismaMock } from './singleton'

describe('GameModel', () => {
    let gameModel: GameModel;
    beforeEach(() => {
        gameModel = new GameModel(prismaMock);
    });
    describe('gets games', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { name: 'test' } };
            await gameModel.findMany(args);
            expect(prismaMock.game.findMany).toHaveBeenLastCalledWith(args);
        });
    });
    describe('gets one game', () => {
        test('with args will pass the args on', async () => {
            const args = { where: { name: 'test' } };
            await gameModel.findOne(args);
            expect(prismaMock.game.findUniqueOrThrow).toHaveBeenLastCalledWith(args);
        });
    });
    describe('create game', () => {
        test('with data will create the game', async () => {
            const args = { data: { name: "test" } };
            await gameModel.create(args);
            expect(prismaMock.game.create).toHaveBeenLastCalledWith(args);
        });
    });
});