import { Prisma, PrismaClient } from '@prisma/client';
import { Types as PrismaTypes } from '@prisma/client/runtime/library';

import Result = PrismaTypes.Result;

// names of models
type ModelName = Prisma.ModelName;
// property name of model
type PrismaModelProp<N extends ModelName> = Uncapitalize<N>;
// the delegate that exposes CRUD operations for the model
type PrismaModelDelegate<N extends ModelName> = PrismaClient[PrismaModelProp<N>];
// model type
type PrismalModel<N extends ModelName> = Result.DefaultSelection<Prisma.Payload<PrismaModelDelegate<N>>>

type FindManyArgs<N extends ModelName> = Prisma.Args<PrismaModelDelegate<N>, 'findMany'>
type FindManyResults<N extends ModelName> = Prisma.Result<PrismaModelDelegate<N>, FindManyArgs<N>, 'findMany'>

type FindUniqueOrThrowArgs<N extends ModelName> = Prisma.Args<PrismaModelDelegate<N>, 'findUniqueOrThrow'>
type FindUniqueOrThrowResults<N extends ModelName> = Prisma.Result<PrismaModelDelegate<N>, FindUniqueOrThrowArgs<N>, 'findUniqueOrThrow'>

type CreateArgs<N extends ModelName> = Prisma.Args<PrismaModelDelegate<N>, 'create'>
type CreateResults<N extends ModelName> = Prisma.Result<PrismaModelDelegate<N>, CreateArgs<N>, 'create'>

type UpdateArgs<N extends ModelName> = Prisma.Args<PrismaModelDelegate<N>, 'update'>
type UpdateResults<N extends ModelName> = Prisma.Result<PrismaModelDelegate<N>, UpdateArgs<N>, 'update'>

/**
 * Abstract class for a model that we can perform CRUD operations on.
 * - N - name of the model
 */
export abstract class Model<N extends ModelName = ModelName> {
    
    /**
     * The prisma client that connects to the database
     */ 
    protected __prisma: PrismaClient;
    
    /**
     * Exposes CRUD operations for the model
     */
    protected abstract __delegate: PrismaModelDelegate<N>;

    constructor(prisma: PrismaClient) {
        this.__prisma = prisma;
    }

    /**
     * Get entities that match the filters
     * @param args args to pass on
     * @returns array of entities
     */
    public abstract findMany(args?: FindManyArgs<N>): Promise<FindManyResults<N>>;

    /**
     * Get the entity that match the filters
     * @param args args to pass on
     * @returns a single entity
     */
    public abstract findOne(args?: FindUniqueOrThrowArgs<N>): Promise<FindUniqueOrThrowResults<N>>;

    /**
     * Create an entity
     * @param data entity info
     * @returns created entity
     */
    public abstract create(args: CreateArgs<N>): Promise<CreateResults<N>>;

    /**
     * Update an entity
     * @param data entity info to update to
     * @param original original info
     * @returns updated entity
     */
    public abstract update(args: UpdateArgs<N>, original: PrismalModel<N>): Promise<UpdateResults<N>>;
    
    /**
     * Delete an entity
     * @param entity entity to delete
     */
    public abstract delete(entity: PrismalModel<N>): Promise<void>;

    /**
     * Get valid data to be used on create/update.
     * This should strip away any data that is automatically assigned on the database among other things.
     * E.g.: id, active
     * @param data data to check for validity
     * @param original original data if this is an update
     */
    protected abstract __getValidData(data: any, original?: PrismalModel<N>): Partial<PrismalModel<N>>;
}