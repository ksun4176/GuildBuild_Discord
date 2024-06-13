import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { ServerRoute } from "./routes/serverroute";
import { GameRoute } from "./routes/gameroute";
import { PrismaClient } from "@prisma/client";
import { GuildRoute } from "./routes/guildroute";
import gracefulShutdown from "http-graceful-shutdown";
import { UserRoute } from "./routes/userroute";

dotenv.config();
const prisma = new PrismaClient();

const app: Express = express();
const port: string = process.env.API_PORT || "9000";

app.use(express.json());
app.use(cors());

const serverRoute = new ServerRoute(prisma).route;
app.use('/servers', serverRoute);
const gameRoute = new GameRoute(prisma).route;
app.use('/games', gameRoute);
const guildRoute = new GuildRoute(prisma).route;
app.use('/guilds', guildRoute);
const userRoute = new UserRoute(prisma).route;
app.use('/users', userRoute);

app.get("/", (_req: Request, res: Response) => {
    res.send("Nothing to see here");
});

const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

gracefulShutdown(server, {
    signals: 'SIGINT SIGTERM SIGUSR2',
    onShutdown: async (signal) => { console.log(`[${signal}] signal received: gracefully shutting down`); },
    finally: () => { console.log('Server graceful shut down completed.'); }
});