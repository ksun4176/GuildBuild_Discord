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
1. Install dependencies using `npm install`
2. In your `.env` file, add `SQL_URL="mysql://{user}:{password}@{host}:{port}/{dbName}"`
   - E.g., `SQL_URL="mysql://root:supersecretpassword@localhost:3306/GuildBuild"`
3. Get the most up to date database schema using `npm run migrate`. This will also seed test data for you to play around with
4. If you need to update the schema, follow the next steps:
5. Make changes in prisma/schema.prisma
6. Create a new migration using `npm run migrate -- --name <name your migration>`
7. If you need to update seed data, do so in `prisma/seed/seed.ts`
8. If you only updated seed data (and not the schema) you can stip steps 4-6 and just test your new seed using `npx prisma db seed`

To start a development server, run these commands in terminal:
1. Install dependencies using `npm install`.
2. If you do not want to use port 9000, in your `.env` file, add `API_PORT=<Custom Port #>`
3. Initiate a development server using `npm run dev`
   - This uses nodemon which will track real time updates to your files and restart the server accordingly.

Once you are done with your changes, run these commands in terminal:
1. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
2. Test that it would work in production using `npm run start`

## Spawning production server: TODO
`npm install --omit=dev`
`npx prisma db seed -- --skipTest`

## Technical Details
The server is created using Node.js, Express, Prisma, and MySQL.
The languages we are using are TypeScript, ...

How to send a request using cURL:
`curl -v -H "Content-Type: application/json" -X POST -d "{ \"server\": { \"name\":\"kaitest\" } }" http://localhost:9000/servers`

### APIs:
/games
- Data structure:
  - name: name of game
- /games
  - GET: Retrieve all games
  - POST: Add a new game
- /games/{gameId}
  - GET: Retrieve one game
  - PUT: Update the game (must be given context from a parent route)
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
- /servers/{serverId}/games
  - links up to the /games route with some serverId checking
- /servers/{serverId}/guilds
  - Data structure:
    - gameId: ID of game this guild is for
    - guildId: In game guild ID
    - name: name of guild
  - /servers/{serverId}/guilds?gameId={gameId}
    - GET: Retrieve all active guilds
    - POST: Add a new guild
  - /servers/{serverId}/guilds/{guildId}
    - GET: Retrieve one guild
    - PUT: Update the guild
    - DELETE: Deactivate the guild
/users
- Data structure:
  - name: name of user
  - discordId: Discord user ID
- /users?serverId={serverId}&gameId={gameId}&guildId={guildId}
  - GET: Retrieve all users
  - POST: Add a new user
- /users/{userId}
  - GET: Retrieve one user
  - PUT: Update the user
  - DELETE: Deactivate the user