import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                fullname: string;
                email: string;
                profilePicture: string | null;
            };
            cookies?: Record<string, string>;
        }
    }
}

export const requireAuth = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const bearerToken = req.headers.authorization?.replace(/^Bearer\s+/i, "");
        const token = req.cookies?.token || bearerToken;

        if(!token){
            console.log(`Authentication required!`)
            return res.status(401).json({message: `Authentication required.`})
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            console.log(`JWT_SECRET is not defined in environment variables.`)
            return res.status(500).json({message: `Server configuration error.`})
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if(typeof decoded === "string" || !decoded.userId){
            console.log(`Invalid Token!`)
            return res.status(401).json({message: `Invalid token.`})
        }

        /**
         * TODO: Implement Redis-based User Verification.
         *
         * - Check user data/status in Redis cache before querying the database.
         * - If valid user data exists in Redis, use it directly.
         * - If cache miss occurs, fetch user from MongoDB.
         * - Store fetched user data in Redis with an appropriate TTL.
         * - Handle cache invalidation when user details or account status change.
         * - Fall back to MongoDB if Redis is unavailable.
         *
         * NOTE: Redis-first user verification is pending implementation.
         */
        const user = await UserModel.findById(decoded.userId);
        if(!user){
            console.log(`User not found!`)
            return res.status(401).json({message: `User not found.`})
        }

        req.user = {
            id: String(user._id),
            fullname: user.fullname,
            email: user.email,
            profilePicture: user.profilePicture ?? null
        }

        return next();
    }
    catch (error) {
        if(error instanceof Error){
            console.log(error.message)
            return res.status(401).json({message: `Invalid or expired token.`})
        }
    }
}
