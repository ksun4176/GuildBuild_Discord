# GuildBuild_API
The server that handles storing/fetching all information about your guild structure within your community.

## Contributing
First and foremost, thank you for working on this project with us!

Now as to how to contribute:
1. Clone this repository onto your local machine
2. Create a new branch
3. Switch to new branch on your local machine
4. Once you commit, creat a merge request (I like merge requests because you can create a checklist of things you want to tackle)

To create a test database:
1. Install dependencies using `npm install`.
2. In your `.env` file, add `SQL_URL="mysql://{user}:{password}@{host}:{port}/{dbName}"`
   - E.g., `SQL_URL="mysql://root:supersecretpassword@localhost:3306/GuildBuild"`
3. Create the database using `npm run migrate`. This will also seed test data for you to play around with.
   - If you have the most updated database and only need to seed data, use `npm run postmigrate`
   - If you want to see what data we're seeding, check out `prisma/seed/seed.ts`

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
The server is created using Node.js, Express, and MySQL.
The languages we are using are TypeScript, ...

### APIs:
/servers
- /servers
  - GET: Retrieve all servers
  - POST: Add a new server
    - E.g., `curl -v -H "Content-Type: application/json" -X POST -d '{ "server": { "name":"kaitest" } }' http://localhost:9000/server`
- /servers/{serverId}
  - GET: Retrieve one server
  - PUT: Update the server
  - DELETE: Deactivate the server