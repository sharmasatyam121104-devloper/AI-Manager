import { Request, Response } from "express";
import { fireBaseApp } from "../config/firebase.config";
import { getAuth } from "firebase-admin/auth";
import UserModel from "../models/user.model";
import jwt from "jsonwebtoken";

export const login = async(req: Request, res: Response)=>{
    try {
        const {token: firebaseToken} = req.body
        if(!firebaseToken){
            console.log(`Token Required!`)
            return res.status(400).json({message: `token is required.`})
        }

        const decoded = await getAuth(fireBaseApp).verifyIdToken(firebaseToken)
        if(!decoded){
            console.log(`Invalid Token!`)
            return res.status(400).json({message: `Invalid token.`})
        }

        let updatedUser = null;

        const user = await UserModel.findOne({firebaseUid: decoded.uid})
        if(!user){
            updatedUser = await UserModel.create({
                firebaseUid: decoded.uid,
                fullname: decoded.name,
                email: decoded.email,
                profilePicture: decoded.picture
            })
        }

        if(user){
            updatedUser = await UserModel.findByIdAndUpdate(user._id, {
                fullname: decoded.name,
                email: decoded.email,
                profilePicture: decoded.picture
            },{new: true})
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if(!JWT_SECRET){
            console.log(`JWT_SECRET is not defined in environment variables.`)
            return res.status(500).json({message: `Server configuration error.`})
        }

        const token =  jwt.sign({userId: updatedUser?._id}, JWT_SECRET, {expiresIn: '7d'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return res.status(200).json({message: `Login successful`, user: updatedUser, token})

    } 
    catch (error) {
        if(error instanceof Error){
            console.log(error.message)
            return res.status(500).json(`Error occurr during login :${error.message}`)
        }    
    }
}


/**
 * TODO: Implement JWT Token Blacklisting on Logout.
 *
 * - Revoke JWT tokens before their actual expiration.
 * - Calculate remaining token lifetime using JWT exp.
 * - Store revoked token hashes in Redis with remaining lifetime as TTL.
 * - Check blacklist during authentication middleware.
 * - Automatically remove entries after token expiration.
 * - Support distributed deployments across multiple server instances.
 */
export const logout = async(req: Request, res: Response)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        })
        return res.status(200).json({message: `Logout successful`})
    } 
    catch (error) {
        if(error instanceof Error){
            console.log(error.message)
            return res.status(500).json(`Error occurred during logout :${error.message}`)
        }
    }
}

export const getCurrentUser = async(req: Request, res: Response)=>{
    try {
        if(!req.user){
            console.log(`User not authenticated!`)
            return res.status(401).json({message: `User not authenticated.`})
        }
        return res.status(200).json({message: `Current user fetched successfully`, user: req.user}) 
    }
    catch (error) {
        if(error instanceof Error){
            console.log(error.message)
            return res.status(500).json(`Error occurred while fetching current user :${error.message}`)
        }

    }
}
