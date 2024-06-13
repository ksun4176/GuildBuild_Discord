# GuildBuild_API
The server that handles storing/fetching all information about your guild structure within your community.

## Contributing
First and foremost, thank you for working on this project with us!

Now as to how to contribute:
1. Clone this repository onto your local machine
2. Create a new branch
3. Switch to new branch on your local machine
4. Once you commit, creat a merge request (I like merge requests because you can create a checklist of things you want to tackle)

To create/update a database:
1. Install dependencies using `npm install`.
2. In your `.env` file, add `SQL_URL="mysql://{user}:{password}@{host}:{port}/{dbName}"`
   - E.g., `SQL_URL="mysql://root:supersecretpassword@localhost:3306/GuildBuild"`
3. Create the database using `npm run migrate`. This will also seed test data for you to play around with.
   - If you only need to seed data, use `npm run seed`
4. At this point, your database should be up to date. If you need to update the schema now, follow the next steps:
5. TODO: Create a migration
6. Update your database using `npm run migrate` again.
7. If you need to update seed data, follow the next steps:
8. Keep seed client in sync with your database using `npm run postmigrate`.
9. Update `prisma/seed/seed.ts` with revised data.
10. Test our your new seed using `npm run seed`

To start a development server, run these commands in terminal:
1. Install dependencies using `npm install`.
2. If you do not want to use port 9000, in your `.env` file, add `API_PORT=<Custom Port #>`
3. Initiate a development server using `npm run dev`
   - This uses nodemon which will track real time updates to your files and restart the server accordingly.

Once you are done with your changes, run these commands in terminal:
1. Install dependencies using `npm install --omit=dev`
2. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
3. Test that it would work in production using `npm run start`

## Technical Details
The server is created using Node.js, Express, Prisma, and MySQL.
The languages we are using are TypeScript, ...

### APIs:
/games
- Data structure:
  - name: name of game
- /games
  - GET: Retrieve all games
- /games/{gameId}
  - GET: Retrieve one game
- /games/{gameId}/guilds
  - Links up to the /guilds route with some gameId checking
/servers
- Data structure:
  - name: name of server
  - discordId: ID of Discord server
- /servers
  - GET: Retrieve all active servers
  - POST: Add a new server
- /servers/{serverId}
  - GET: Retrieve one server
  - PUT: Update the server
  - DELETE: Deactivate the server
- /servers/{serverId}/guilds?gameId={gameId}
  - Links up to the /guilds route with some serverId checking
- /servers/{serverId}/users?gameId={gameId}
  - Links up to the /users route with some serverId checking
/guilds
- Data structure:
  - gameId: ID of game this guild is for
  - guildId: In game guild ID
  - name: name of guild
  - serverId: ID of server this guild is in
- /guilds
  - GET: Retrieve all active guilds (must be given context from a parent route)
  - POST: Add a new guild
- /guilds/{guildId}
  - GET: Retrieve one guild
  - PUT: Update the guild
  - DELETE: Deactivate the guild
- /guilds/{guildId}/users
  - Links up to the /users route with some guildId checking
/users
- Data structure:
  - name: name of user
  - discordId: Discord user ID
- /users
  - GET: Retrieve all users (must be given context from a parent route)
  - POST: Add a new user
- /users/{userId}
  - GET: Retrieve one user
  - PUT: Update the user
  - DELETE: Deactivate the user