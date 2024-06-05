# GuildBuild_Discord
A bot to create their community structure straight within Discord.

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
1. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
2. Deply commands using `npm run register`

Once you are done with your changes, run these commands in terminal:
1. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
2. Test that it would work in production using `npm run start`