import { PrismaClient, Prisma, User } from '@prisma/client'
import { Model } from './model';
import { DefaultArgs } from '@prisma/client/runtime/library';

export const messages = {
    missingObject: 'Missing user object',
    missingName: 'Missing name property',
    notActive: 'User has been deleted',
    mismatchDiscordId: 'Trying to overwrite discord ID? Suspicious...'
}

export class UserModel extends Model<Prisma.UserDelegate, User, Prisma.UserWhereInput> {

    protected override __delegate: Prisma.UserDelegate<DefaultArgs>;

    constructor(prisma: PrismaClient) {
        super(prisma);
        this.__delegate = this.__prisma.user;
    }

    /**
     * Get users that match the filters
     * @param whereArgs the filters
     * @returns array of users
     */
    public async get(whereArgs?: Partial<Prisma.UserWhereInput>): Promise<User[]> {
        return await this.__delegate.findMany({
            where: whereArgs
        });
    }

    /**
     * Create a user
     * @param data user info
     * @returns created user
     */
    public async create(data: any): Promise<User> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!data.name) {
            throw new Error(messages.missingName);
        }
        return await this.__delegate.create({
            data: this.__getUserData(data)
        });
    }

    /**
     * Update a user
     * @param data user info to update to
     * @param original original info
     * @returns updated user
     */
    public async update(data: any, original: User): Promise<User> {
        if (!data) {
            throw new Error(messages.missingObject);
        }
        if (!original.active) {
            throw new Error(messages.notActive);
        }
        if (original.discordId && data.discordId && original.discordId !== data.discordId) {
            throw new Error(messages.mismatchDiscordId);
        }
        return await this.__delegate.update({
            where: { id: original.id },
            data: this.__getUserData(data)
        });
    }

    /**
     * Delete a user
     * @param original original info
     */
    public async delete(original: User): Promise<void> {
        await this.__delegate.update({
            where: { id: original.id },
            data: { active: false }
        });
    }
    
    /**
     * Get all valid user properties that we can set when updating/creating
     * @param data new user info
     * @returns valid user properties
     */
    private __getUserData(data: any) {
        return {
            name: data.name, 
            discordId: data.discordId 
        };
    }
}

