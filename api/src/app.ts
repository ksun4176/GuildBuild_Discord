import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testAPIRoute } from "./routes/testAPI";

dotenv.config();

const app: Express = express();
const port: string = process.env.PORT || "9000";

app.use(cors());
app.use("/testAPI", testAPIRoute);
app.get("/", (_req: Request, res: Response) => {
  res.send("OK that is cool Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});