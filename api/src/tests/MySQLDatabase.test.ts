// import { Server } from "../classes/Server";
// import { MySQLDatabase } from "../MySQLDatabase";

// describe('MySQLDatabase module', () => {
//     let db: MySQLDatabase;
//     beforeEach(() => {
//         db = new MySQLDatabase();
//     });
//     describe('gets servers', () => {
//         test('with no ID specified will pass no conditions', async () => {
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery;
//             await db.getServers();
//             expect(mockQuery).toHaveBeenLastCalledWith(['SELECT * FROM Server'],[]);
//         });
//         test('with ID specified will add the ID as a condition', async () => {
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery
//             const id = 1;
//             await db.getServers(id);
//             expect(mockQuery).toHaveBeenLastCalledWith([
//                 'SELECT * FROM Server',
//                 'WHERE id = ?'
//             ],
//             [id]);
//         });
//     });
//     describe('insert server', () => {
//         test('with provided name will insert the row', async () => {
//             const mockQuery = jest.fn().mockResolvedValue({insertId: 1});
//             db["__query"] = mockQuery;
//             const server = new Server(null as any, "test");
//             await db.insertServer(server);
//             expect(mockQuery).toHaveBeenCalled();
//         });
//         test('with no name will error out', async () => {
//             expect.assertions(2);
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery;
//             const server = new Server(null as any, null as any);
//             try {
//                 await db.insertServer(server);
//             }
//             catch (err) {
//                 expect(err).toMatch('No name provided');
//             }
//             expect(mockQuery).not.toHaveBeenCalled();
//         });
//     });
//     describe('update a server', () => {
//         test('with matching IDs will update row', async () => {
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery;
//             const id = 1;
//             const server = new Server(id, "test");
//             await db.updateServer(id, server);
//             expect(mockQuery).toHaveBeenCalled();
//         });
//         test('with mismatched IDs will error out', async () => {
//             expect.assertions(2);
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery;
//             const id = 1;
//             const server = new Server(id+1, "test");
//             try {
//                 await db.updateServer(id, server);
//             }
//             catch (err) {
//                 expect(err).toMatch('ID mismatch found');
//             }
//             expect(mockQuery).not.toHaveBeenCalled();
//         });
//     });
//     describe('sets a server status', () => {
//         test('to active will update row accordingly', async () => {
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery;
//             const id = 1;
//             await db.setServerActive(id, true);
//             expect(mockQuery).toHaveBeenCalledWith([
//                 'UPDATE Server SET',
//                 'active = 1',
//                 'WHERE id = ?'
//             ], 
//             [id]);
//         });
//         test('with mismatched IDs will error out', async () => {
//             const mockQuery = jest.fn();
//             db["__query"] = mockQuery;
//             const id = 1;
//             await db.setServerActive(id, false);
//             expect(mockQuery).toHaveBeenCalledWith([
//                 'UPDATE Server SET',
//                 'active = 0',
//                 'WHERE id = ?'
//             ], 
//             [id]);
//         });
//     });
// });