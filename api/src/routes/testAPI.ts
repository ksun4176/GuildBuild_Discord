import { Request, Response, Router } from "express";

export const testAPIRoute = Router();

testAPIRoute.get("/", function(_req: Request, res: Response) {
    res.send("API is working properly");
});