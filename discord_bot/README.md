# GuildBuild_Discord
A bot to create their community structure straight within Discord.

## How to Use
### Set up Server and Guilds (can be ran by server owner + admins)
1. Server owner: Add bot to server
   - Go to https://discord.com/oauth2/authorize?client_id=1246175342918635530&permissions=378225577024&integration_type=0&scope=bot
   - Select your server
   - Press Authorize
2. Server owner: Run ```/setupserver```
   - (Optional) Add server admin role so give other users permission to manage the server
3. Run ```/addgame``` to let us know what games you are playing
   - (Optional) Add a shared guild lead/management/member role to more easily mention the whole group of people
4. Run ```/createguild``` for each guild

### User Management (can be ran by server owner + admins + guild management)
1. Add server admin/guild lead/guild management role to the right people to give them permission to run respective commands
2. Anyone: Run ```/applyguild``` to apply for any guild
   - (Optional) Specify a guild to apply to directly
3. To handle an application, you can:
   - Run ```/application accept``` to accept a user into a guild
   - Admin: Run ```/application decline``` to decline user from ALL guilds
4. Run ```/application accept``` to transfer user to new guild
   - You will then be prompted to remove old guild roles which is equivalent to a transfer
5. Run ```/kickguild``` to kick a user from guilds
   - (Optional) Specify a single guild to kick the user from

**<u>NOTES:</u>**

1. It is ok for a user to be in multiple guilds

## File Structure
All development files can be found in `src/`. All other folders are auto generated so they do not need to be touched.

- ./app.ts: Entrypoint of our bot
- ./*[Interface/Helper].ts: General set up functions and typings
- ./commands/*: All of our commands (NOTE: our code look at all commands in this directory and subdirectory level deeper)
- ./events/*: All of our events (NOTE: our code looks at all events at this level only)

## Contributing
The server is created using Node.js.
The languages we are using are TypeScript, ...

Once you've cloned the repository, install dependencies with `npm install`.

To start a development bot, run these commands in terminal:
1. Install node dependencies using `npm install`
2. Initiate a development server using `npm run dev`
   - This uses nodemon which will track real time updates to your TypeScript + JSON and restart the server accordingly. 

If you change the command definition (description, options, etc.), you will need to redeploy:
(NOTE: You do not need to redeploy if you make updates to the execute function)
1. Deploy commands using `npm run register`
   - Node does not run on TypeScript so we need to create the corresponding JavaScript files before registering commands

Once you are done with your changes, run these commands in terminal:
1. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
2. Test that it would work in production using `npm run start`