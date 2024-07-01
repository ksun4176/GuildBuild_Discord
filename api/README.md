# GuildBuild_API
The server that handles storing/fetching all information about your guild structure within your community.

## Contributing
First and foremost, thank you for working on this project with us!

Now as to how to contribute:
1. Clone this repository onto your local machine
2. Create a new branch
3. Switch to new branch on your local machine
4. Duplicate `.env.example` into a file named `.env`
   - Fill in blank variables
5. Run `docker-compose -f docker-compose.dev.yml up -d`
   - This will spin up a docker container for (1) a MySQL database (2) and a development server
6. We now need to populate your test database
   1. Run `npm install`
   2. Go into your `.env` and swap which `DB_URL` is commented out
      - The way your local machine access the database and a docker container in the same network access it is different.
   2. Update your database schema using `npm run migrate`
   3. If your database does not have any data, also run `npx prisma db seed`
7. (Optional) After you make your first commit, create a merge request to better track your work

To update the database schema:
1. Make changes in prisma/schema.prisma
2. If you need to update seed data, do so in `prisma/seed/seed.ts`
3. Create a new migration using `npm run migrate -- --name <name your migration>`

To make changes to the server:
1. Make changes in whichever file
2. Rebuild container using `docker-compose -f docker-compose.dev.yml up -d --build`
3. Access your server and verify changes

To verify this would work in production:
1. Rebuild container using `docker-compose -f docker-compose.prod.yml up -d --build`
2. Access your server and verify changes

## Technical Details
The server is created using Docker, Node.js, and MySQL.
Some noteable node packages are Express and Prisma.
The languages we are using are TypeScript, ...

## /servers
### Resource
```
```
### **GET**: /servers `Get a list of all servers`
Path Parameters:
```
```
Query Parameters:
```
- gameId
```
Request Body:
```
```
Example Request:
```
```
Example Response:
```
```
### **POST**: /servers `Add a new server`
Request Body:
```
server: {
  name (string): name of server,
  discordId (string?): ID of linked discord server,
  owner (user): person who created the server
  {
    id (number?): ID of owner if already in database,
    discordId (number?): If id is blank, look up user using this
  },
  ownerRole (userrole?):
  {
    name (string?): name of role
    discordId (string?): ID of linked discord role
  },
}
```
Example Request:
```
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{ "server": { "name": "example_server", "discordId": "example_server_id", "owner": { "id": 345 }, "ownerRole": { "name": "Supreme Owner", "discordId": "supreme_owner_id" } } }' \
  http://localhost:9000/servers
```
Example Response:
```
Status: 201 Created
Body:
{
  id: 991,
  name: "example_server",
  discordId: "example_server_id",
  active: true,
  owner: {
    id: 345,
    name: "server_owner_1",
    discordId: "example_owner_id_1",
    active: true
  }
}
```
## /games
### **POST**: /games `Add a new game to the system`
Request Body:
```
game: {
  name (string): name of game
}
```
Example Request:
```
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{ "game": { "name": "example_game" } }' \
  http://localhost:9000/games
```
Example Response:
```
Status: 201 Created
Body:
{
  id: 991,
  name: "example_game"
}
```
### **POST**: servers/{serverId}/games/{gameId} `Add a game to a server`
Path Parameters:
```
serverId (number): server to add game to
gameId (number): game to add to server
```
Example Request:
```
curl -v -X POST \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers/345/games/991
```
Example Response:
```
Status: 201 Created
Body:
{
  id: 235,
  gameId: 991,
  serverId: 345,
  guildId: '',
  name: 'GameGuildPlaceholder991',
  active: true
}
```
## /guilds
### **POST**: /servers/{serverId}/guilds `Add a guild to a server`
Path Parameters:
```
serverId (number): server to add game to
```
Request Body:
```
guild: {
  gameId (number): game this guild belongs to,
  guildId (string): unique ID of guild in game,
  name (string): name of guild,
  leadRole (userrole?): details to add to lead role
  {
    name (string?): name of role
    discordId (string?): ID of linked discord role
  },
  managementRole (userrole?):
  {
    name (string?): name of role
    discordId (string?): ID of linked discord role
  },
  memberRole (userrole?):
  {
    name (string?): name of role
    discordId (string?): ID of linked discord role
  },
}
```
Example Request:
```
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{ "guild": { "name": "example_guild", "gameId": 991, "guildId": "436234", "leadRole": { "name": "Guild Lead", "discordId": "lead_id" }, "managementRole": { "name": "Guild Management", "discordId": "management_id" }, "memberRole": { "name": "Guild Member", "discordId": "member_id" } } }' \
  http://localhost:9000/servers/345/guilds
```
Example Response:
```
Status: 201 Created
Body:
{
  id: 634,
  gameId: 991,
  serverId: 345,
  guildId: '436234',
  name: 'example_guild',
  active: true
}
```
## /users
### **POST**: /users `Add a user`
Request Body:
```
user: {
  name (string): name of user
  discordId (string?): ID of linked discord user
}
```
Example Request:
```
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{ "user": { "name": "example_user", "discordId": "example_user_id" } }' \
  http://localhost:9000/users
```
Example Response:
```
Status: 201 Created
Body: 
{
  id: 463,
  name: 'example_user',
  discordId: 'example_user_id',
  active: true
}
```

### APIs:
/games
- Data structure:
  - name: name of game
- /games
  - GET: Retrieve all games
- /games/{gameId}
  - GET: Retrieve one game
/servers
- Data structure:
  - name: name of server
  - discordId: ID of Discord server
- /servers
  - GET: Retrieve all active servers
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
- /users/{userId}
  - GET: Retrieve one user
  - PUT: Update the user
  - DELETE: Deactivate the user