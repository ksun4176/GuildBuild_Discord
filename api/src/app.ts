import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import { ServerRoute } from "./routes/server";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const app: Express = express();
const port: string = process.env.API_PORT || "9000";

app.use(express.json());
app.use(cors());

const serverRoute = new ServerRoute(prisma).route;
app.use('/servers', serverRoute);

app.get("/", (_req: Request, res: Response) => {
    res.send("Nothing to see here");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});