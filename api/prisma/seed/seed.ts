/**
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";

const main = async () => {
    const seed = await createSeedClient();

    // Truncate all tables in the database
    await seed.$resetDatabase();

    // Seed the database with the expected games
    await seed.game([
        {id: 1, name: 'AFK Arena'}
    ]);
    // Seed the database with the expected user_role_types
    await seed.user_role_type([
        {id: 1, name: 'Server Owner'},
        {id: 2, name: 'Administrator'},
        {id: 3, name: 'Moderator'},
        {id: 4, name: 'Guild Management'},
        {id: 5, name: 'Recruiter'},
        {id: 6, name: 'Guild Member'},
    ]);
    
    console.log("Database seeded successfully!");
    process.exit();
};

main();