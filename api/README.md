# GuildBuild_API
The server that handles storing/fetching all information about your guild structure within your community.

## Contributing
Once you've cloned the repository, install dependencies with `npm install`.

To start a development server, run these commands in terminal:
1. Initiate a development server using `npm run dev`
   - This uses nodemon which will track real time updates to your files and restart the server accordingly. 

Once you are done with your changes, run these commands in terminal:
1. Generate corresponding JavaScript files using `npm run build`
   - Node does not run on TypeScript so we need to create them so it runs
2. Test that it would work in production using `npm run start`

## Technical Details
The server is created using Node.js, Express, and MySQL.
The languages we are using are TypeScript, ...

### APIs:
/server
- Data structure: 
  - id
  - name: name of server
  - discord_id: linked discord ID
  - active
- /server
  - GET: Retrieve all servers
  - POST: Add a new server
    - Example: "curl -v -H "Content-Type: application/json" -X POST -d "{ \"server\": { \"name\":\"kaitest\" } }" http://localhost:9000/server"
- /server/{serverId}
  - GET: Retrieve one server
  - PUT: Update the server
  - DELETE: Deactivate the server