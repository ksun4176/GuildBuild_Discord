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

    // Seed the database with user_role_types
    const roleTypes = [
        'Server Owner',
        'Administrator',
        'Guild Lead',
        'Guild Management',
        'Guild Member',
    ]
    await seed.userRoleType(roleTypes.map((type, index) => { return { id: index+1, name: type } }));
    // Seed the database with games
    const games = [
        'AFK Arena'
    ]
    await seed.game(games.map((game, index) => { return { id: index+1, name: game } }));

    if (!skipTest) {
        // Seed the database with users
        await seed.user((x) => x({ min: 20, max: 50 }, (ctx) => ({
            name: `User ${ctx.index+1}`,
            discordId: `id${ctx.index+1}`
        })));
        // Seed the database with servers
        await seed.server((x) => x({ min: 3, max: 9 }, (ctx) => ({
            name: `Gubi Test Server ${ctx.index+1}`
        })));
        for (const server of seed.$store.server) {
            // Seed the database with server owner roles
            await seed.userRole([{
                id: server.id,
                name: `${server.name} Owner`,
                roleType: 1,
                serverId: server.id
            }]);
            // Seed the database with links between user + roles
            await seed.userRelation([{
                userId: server.id,
                roleId: server.id,
            }]);
            // Seed placeholder guilds
            await seed.guild([{
                gameId: Math.floor(Math.random() * games.length + 1),
                guildId: '', 
                name: 'GameGuildPlaceholder1', 
                serverId: server.id
            }]);
            // Seed the database with test guilds
            await seed.guild((x) => x({min: 1, max: 3}, (ctx) => ({
                gameId: Math.floor(Math.random() * games.length + 1),
                guildId: `${server.id}${ctx.index+1}`,
                name: `Gubii Test Guild ${ctx.index+1}`, 
                serverId: server.id
            })));
        }
    }
    
    console.log("Database seeded successfully!");
    process.exit();
};

main();