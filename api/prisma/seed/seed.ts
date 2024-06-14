/**
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import { parseArgs } from 'node:util';

const main = async () => {
    const { values: { skipTest } } = parseArgs({ options: {
        skipTest: { type: 'boolean' }  
    } });

    const seed = await createSeedClient();

    // Truncate all tables in the database
    await seed.$resetDatabase();

    // Seed the database with the expected user_role_types
    await seed.user_role_type([
        {id: 1, name: 'Server Owner'},
        {id: 2, name: 'Administrator'},
        {id: 3, name: 'Guild Lead'},
        {id: 4, name: 'Guild Management'},
        {id: 5, name: 'Guild Member'},
    ]);
    // Seed the database with the expected games
    await seed.game([
        {id: 1, name: 'AFK Arena'}
    ]);
    if (!skipTest) {
        // Seed the database with a test server
        await seed.server((x) => x({ min: 3, max: 9 }, (ctx) => ({
            name: `Gubi Test Server ${ctx.index}`
        })));
        // Seed placeholder guilds
        for (const server of seed.$store.server) {
            await seed.guild([{
                game_id: 1, 
                guild_id: '', 
                name: 'GameGuildPlaceholder1', 
                server_id: server.id
            }]);
        }
        // Seed the database with test guilds
        for (const server of seed.$store.server) {
            await seed.guild((x) => x({min: 1, max: 3}, (ctx) => ({
                game_id: 1, 
                guild_id: `${server.id}${ctx.index}`,
                name: `Gubii Test Guild ${ctx.index}`, 
                server_id: server.id
            })));
        }
        // Seed the database with users
        await seed.user((x) => x({ min: 20, max: 50 }, (ctx) => ({
            name: `User ${ctx.index}`,
            discord_id: `id${ctx.index}`
        })));
    }
    
    console.log("Database seeded successfully!");
    process.exit();
};

main();