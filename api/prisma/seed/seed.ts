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

    // Seed user_role_types
    const roleTypes = [
        'Server Owner',
        'Administrator',
        'Guild Lead',
        'Guild Management',
        'Guild Member',
    ]
    await seed.userRoleType(roleTypes.map((type, index) => { return { id: index+1, name: type } }));
    // Seed games
    const games = [
        'AFK Arena'
    ]
    await seed.game(games.map((game, index) => { return { id: index+1, name: game } }));

    if (!skipTest) {
        // Seed users
        await seed.user((x) => x({ min: 20, max: 50 }, (ctx) => ({
            name: `User ${ctx.index+1}`,
            discordId: `user${ctx.index+1}`
        })));
        // Seed servers
        await seed.server((x) => x({ min: 3, max: 9 }, (ctx) => ({
            name: `Gubii Test Server ${ctx.index+1}`,
            discordId: `server${ctx.index+1}`
        })));
        for (const server of seed.$store.server) {
            // Seed server owner roles
            await seed.userRole([{
                id: server.id,
                name: `${server.name} Owner`,
                roleType: 1,
                serverId: server.id,
                discordId: `server${server.id}owner`
            }]);
            // Seed links between user + roles
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
            // Seed test guilds
            await seed.guild((x) => x({min: 1, max: 3}, (ctx) => ({
                gameId: Math.floor(Math.random() * games.length + 1),
                guildId: `${server.id}${ctx.index+1}`,
                name: `${server.id} Gubii Test Guild ${ctx.index+1}`, 
                serverId: server.id
            })));
        }

        // Seed test guilds with guild roles
        for (const guild of seed.$store.guild) {
            // skip placeholders
            if (guild.guildId === '') {
                continue;
            } 
            // Seed guild lead roles
            await seed.userRole([{
                name: `${guild.name} Lead`,
                roleType: 3,
                serverId: guild.serverId,
                guildId: guild.id,
                discordId: `guild${guild.id}lead`
            }]);
            // Seed guild management roles
            await seed.userRole([{
                name: `${guild.name} Management`,
                roleType: 4,
                serverId: guild.serverId,
                guildId: guild.id,
                discordId: `guild${guild.id}manager`
            }]);
            // Seed guild member roles
            await seed.userRole([{
                name: `${guild.name} Member`,
                roleType: 5,
                serverId: guild.serverId,
                guildId: guild.id,
                discordId: `guild${guild.id}member`
            }]);
        }
    }
    
    console.log("Database seeded successfully!");
    process.exit();
};

main();