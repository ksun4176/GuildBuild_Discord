import { PrismaClient } from "@prisma/client";
import { Router, RouterOptions } from "express";
import prisma from "../tests/prismaclient";

/**
 * Abstract class for an API route
 */
export abstract class Route {
    /**
     * The prisma client that connects to the database
     */ 
    protected __prisma: PrismaClient;    

    /** The router */
    private __route: Router;
    public get route(): Router {
        return this.__route;
    }

    constructor(_prisma: PrismaClient, routerOptions?: RouterOptions) {
        this.__prisma = prisma;
        this.__route = Router(routerOptions);
        this.__setUpRoute();
    }
    
    /**
     * Set up all routes
     */
    protected abstract __setUpRoute(): void;
}