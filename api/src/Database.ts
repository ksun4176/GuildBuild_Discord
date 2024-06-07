import { Server } from './classes/Server';

/**
 * Database interfaces required
 * T: the union type for what a row in the database is
 */
export interface Database<T> {
    /**
     * Get a list of servers
     * @param id ID of server
     * @returns List of servers
     */
    getServers(id?: number): Promise<(Server & T)[]>;
    /**
     * Add a server
     * @param server server to add
     * @returns the inserted ID
     */
    insertServer(server: Server): Promise<number>;
    /**
     * Update a server
     * @param id ID of server
     * @param server server to update
     */
    updateServer(id: number, server: Server): Promise<void>;
    /**
     * Set the server active status
     * @param id ID of server
     * @param isActive Whether to activate or deactivate
     */
    setServerActive(id: number, isActive: boolean): Promise<void>;
}