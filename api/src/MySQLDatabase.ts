import { Pool } from 'mysql2/typings/mysql/lib/Pool';
import { Server } from './classes/Server';
import { Database } from './Database';
import mySQL, { FieldPacket, QueryError, ResultSetHeader, RowDataPacket } from 'mysql2';

type SqlTemplateValues = (number|string|undefined)[];

export class MySQLDatabase implements Database<RowDataPacket> {
    
    /** A pool of SQL connections */
    pool: Pool;
    constructor() {
        this.pool = mySQL.createPool({
            // acquireTimeout: ,
            // waitForConnections: ,
            connectionLimit: process.env.SQL_MAX_CONNECTIONS ? parseInt(process.env.SQL_MAX_CONNECTIONS) : undefined,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DATABASE,
            // charset: ,
            // timeout: ,
            host: process.env.SQL_HOST,
            port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT) : undefined,
            // localAddress: ,
            // socketPath: ,
            // timezone: ,
            // connectTimeout: ,
            // supportBigNumbers: ,
            // debug: ,
            // trace: ,
            // multipleStatements: ,
            // flags: ,
            // ssl: ,
        });
    }

    /**
     * Query the database
     * @param query the SQL query to run. The array will be concatenated using " "
     * @param templateValues values for the templated SQL query
     * @returns the query response
     */
    private async __query(query: string[], templateValues?: SqlTemplateValues): Promise<any> {
        return new Promise((resolve, reject) => {
            const callback = (err: QueryError | null, results: any, _fields: FieldPacket[]) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            }
            this.pool.query(query.join(" "), templateValues, callback);
        });
    }

    async getServers(id?: number): Promise<(Server & RowDataPacket)[]> {
        let sqlQuery = ['SELECT * FROM Server'];
        let sqlParams: SqlTemplateValues = [];
        if (id !== undefined) {
            sqlQuery.push('WHERE id = ?');
            sqlParams.push(id);
        }
        let servers = await this.__query(sqlQuery, sqlParams);
        // if only single result, put it in an array
        if (!Array.isArray(servers)) {
            servers = [servers];
        }
        return servers;
    }
    
    async insertServer(server: Server): Promise<number> {
        if (!server.name) {
            return Promise.reject('No name provided');
        }
        const sqlQuery = [
            'INSERT INTO Server',
            '(name, discord_id)',
            'VALUES (?, ?)'
        ]
        const sqlParams: SqlTemplateValues = [server.name, server.discord_id];
        const sqlResult: ResultSetHeader = await this.__query(sqlQuery, sqlParams);
        return sqlResult.insertId;
    }

    async updateServer(id: number, server: Server): Promise<void> {
        if (id !== server.id) {
            return Promise.reject('ID mismatch found');
        }
        let sqlQuery = [
            'UPDATE Server SET',
            'name = ?,',
            'discord_id = ?',
            'WHERE id = ?'
        ]
        let sqlParams: SqlTemplateValues = [server.name, server.discord_id, id];
        await this.__query(sqlQuery, sqlParams);
    }

    async setServerActive(id: number, isActive: boolean): Promise<void> {
        let sqlQuery = [
            'UPDATE Server SET',
            `active = ${isActive ? '1' : '0'}`,
            'WHERE id = ?'
        ]
        let sqlParams: SqlTemplateValues = [id];
        await this.__query(sqlQuery, sqlParams);
    }
}