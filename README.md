# GuildBuild_Discord
A discord bot to handle building a guild structure for any game that you're playing.

## Contributing
The server is created using Node.js and Express.
The languages we are using are TypeScript, ...

Once you've cloned the repository, install dependencies with `npm install`.

To start a development bot, run these commands in terminal:
1. Install node dependencies using `npm install`
2. Initiate a development server using `npm run dev`
   - This uses nodemon which will track real time updates to your TypeScript + JSON and restart the server accordingly. 

Once you are done with your changes, run these commands in terminal:
1. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
2. Test that it would work in production using `npm run start`