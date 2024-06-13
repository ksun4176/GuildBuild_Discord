import { PrismaClient } from "@prisma/client";

/**
 * Abstract class for a model that we can perform CRUD operations on
 */
export abstract class Model<A = unknown, B = unknown, C = unknown> {
    
    /**
     * The prisma client that connects to the database
     */ 
    protected __prisma: PrismaClient;
    
    /**
     * Exposes CRUD operations for the model
     */
    protected abstract __delegate: A;

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
    }

    /**
     * Get entities that match the filters
     * @param whereArgs the filters
     * @returns array of entities
     */
    public abstract get(whereArgs?: Partial<C>): Promise<B[]>;


    /**
     * Create an entity
     * @param data entity info
     * @returns created entity
     */
    public abstract create(data: any): Promise<B>;
    /**
     * Update an entity
     * @param data entity info to update to
     * @param original original info
     * @returns updated entity
     */
    public abstract update(data: any, original: B): Promise<B>;
    /**
     * Delete an entity
     * @param original original info
     */
    public abstract delete(original: B): Promise<void>;
}