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
id (number): Unique identifier for server
name (string): Name of server
discordId (string): linked discord server
guilds (number[]): A list of all guilds that are in a server
games (number[]): A list of all games that are supported in a server
owner: Details on server owner
{
  roleId (number): server owner role,
  userId (number): owner
}
admins: Details on server admins
{
  roleId (number): server administrator role,
  userIds (number[]): A list of admins
}
```
### **GET**: /servers `Get a list of all servers`
Query Parameters:
```
gameId (number): game to find servers that support it
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers?gameId=991
```
Example Response:
```
Status: 200 OK
Body:
[
  {
    id: 991,
    name: "example_server",
    discordId: "example_server_id"
  },
  {
    id: 523,
    name: "example_server_2",
    discordId: "example_server_id2"
  },
]
```
### **GET**: /servers/{serverId} `Get details on a single server`
Path Parameters:
```
serverId (number?): server to find details on
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers/345
```
Example Response:
```
Status: 200 OK
Body: 
{
  id: 991,
  name: "example_server",
  discordId: "example_server_id",
  guilds: [343, 345, 644],
  games: [1, 2, 3],
  owner: {
    roleId: 421,
    userId: 345
  },
  admins: {
    roleId: 524,
    userIds: [523, 543, 654]
  }
}
```
### **POST**: /servers `Add a new server`
Request Body:
```
server: {
  name (string): name of server,
  discordId (string?): linked discord server,
  owner (user): person who created the server
  {
    id (number?): owner if already in database,
    discordId (number?): If id is blank, look up user using this
  },
  ownerRole (userrole?):
  {
    name (string?): name of role
    discordId (string?): linked discord role
  },
  adminRole (userrole?): details to add to admin role
  {
    name (string?): name of role
    discordId (string?): linked discord role
  }
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
### Resource
```
id (number): Unique identifier for game
name (string): Name of game
guilds (number[]): A list of all guilds that are for a game in a server. Only passed back when a serverId is passed in.
```
### **GET**: /servers/{serverId}/games `Get a list of all games`
Path Parameters:
```
serverId (number?): server to find related games
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/games
  
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers/345/games
```
Example Response:
```
Status: 200 OK
Body: 
{
  [
    {
      id: 123,
      name: "example_game_1"
    },
    {
      id: 234,
      name: "example_game_2"
    }
  ]  
}
```
### **GET**: /servers/{serverId}/games/{gameId} `Get details on a single game`
Path Parameters:
```
serverId (number?): server to check whether the game is supported on it
gameId (number): game to get details on. 
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/games/123

curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers/345/games/123
```
Example Response:
```
Status: 200 OK
Body: 
{
  id: 123,
  name: "example_game_1",
  guilds: [343, 345, 644]
}
```
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
### **POST**: /servers/{serverId}/games/{gameId} `Add a game to a server`
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
### Resource
```
id (number): Unique identifier for guild
name (string): Name of guild
serverId (number): Server that the guild belongs to
gameId (number): Game that the guild belongs to
guildId (string): Unique identifier for guild in game
lead: Details on guild lead
{
  roleId (number): guild lead role,
  userId (number): guild lead
}
management: Details on guild management
{
  roleId (number): guild management role,
  userIds (number[]): A list of management
}
members: Details on guild members
{
  roleId (number): guild members role,
  userIds (number[]): A list of members
}
```
### **GET**: /servers/{serverId}/guilds `Get a list of all guilds`
Path Parameters:
```
serverId (number): server to find guilds in it
```
Query Parameters:
```
gameId (number): game to find guilds that support it
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers/345/guilds?gameId=991
```
Example Response:
```
Status: 200 OK
Body:
[
  {
    id: 634,
    gameId: 991,
    serverId: 345,
    guildId: '436234',
    name: 'example_guild',
  },
  {
    id: 643,
    gameId: 991,
    serverId: 345,
    guildId: '654352',
    name: 'example_guild_2',
  }
]
```
### **GET**: /servers/{serverId}/guilds/{guildId} `Get details on a single guild`
Path Parameters:
```
serverId (number): server to check whether the guild is in it
guildId (number): guild to find details on
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/servers/345/guilds/634
```
Example Response:
```
Status: 200 OK
Body: 
{
  id: 634,
  gameId: 991,
  serverId: 345,
  guildId: '436234',
  name: 'example_guild',
  lead: {
    roleId: 543,
    userId: 765
  },
  management: {
    roleId: 153,
    userIds: [675, 809, 980]
  },
  members: {
    roleId: 987,
    userIds: [678, 523, 123]
  }
}
```
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
    discordId (string?): linked discord role
  },
  managementRole (userrole?):
  {
    name (string?): name of role
    discordId (string?): linked discord role
  },
  memberRole (userrole?):
  {
    name (string?): name of role
    discordId (string?): linked discord role
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
### Resource
```
id (number): Unique identifier for user
name (string): Name of user
discordId (string): linked discord user
email (string): email of user
guilds (number[]): A list of all guilds that this user is in
games (number[]): A list of all games that this user play in
roles (number[]): A list of all roles that the user has
```
### **GET**: /users `Get a list of all users`
Query Parameters:
```
serverId (number?): server to find users in it
guildId (number?): guild to find users in it
discordId (number?): discord ID of user to find
```
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/users?serverId=345&guildId=645
```
Example Response:
```
Status: 200 OK
Body:
[
  {
    id: 463,
    name: 'example_user',
    discordId: 'example_user_id',
    email: 'user@gmail.com',
    active: true
  },
  {
    id: 564,
    name: 'example_user_2',
    discordId: 'example_user_id_2',
    email: 'user2@gmail.com',
    active: true
  }
]
```
### **GET**: /users/{userId} `Get details on a single user`
Example Request:
```
curl -v -X GET \
  -H "Content-Type: application/json" \
  http://localhost:9000/users/564
```
Example Response:
```
Status: 200 OK
Body: 
{
  id: 463,
  name: 'example_user',
  discordId: 'example_user_id',
  active: true,
  email: 'user@gmail.com',
  guilds: [343, 345, 644],
  games: [1, 2, 3],
  roles: [42, 43, 23]
}
```
### **POST**: /users `Add a user`
Request Body:
```
user: {
  name (string): name of user
  discordId (string?): linked discord user
  email (string?): email of user
}
```
Example Request:
```
curl -v -X POST \
  -H "Content-Type: application/json" \
  -d '{ "user": { "name": "example_user", "discordId": "example_user_id", "email": "user@gmail.com" } }' \
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
  email: "user@gmail.com"
  active: true
}
```
## /{route}
### Resource
```
```
### **{HTML FUNCTION}**: /{route} {description}
Path Parameters:
```
```
Query Parameters:
```
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

### APIs:
/servers
- /servers/{serverId}
  - PUT: Update the server
  - DELETE: Deactivate the server
- /servers/{serverId}/guilds/{guildId}
  - PUT: Update the guild
  - DELETE: Deactivate the guild
/users
- /users/{userId}
  - PUT: Update the user
  - DELETE: Deactivate the user