import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User, { IUser } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;
    if (!bearer) {
        res.status(401).send("Unauthorized. No token provided.");
        return;
    }
    const token = bearer.split(" ")[1];
    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id).select('id name email');
            
            if(user) {
                req.user = user;
                next();
            } else {
                res.status(404).send("User not found.");
                return;
            }
        }        
    } catch (error) {
        res.status(401).send(error.message);
    }
}

export const hasAuthorization = (req: Request, res: Response, next: NextFunction) => {
    if(req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error("Unauthorized. You are not the project manager.");
        res.status(403).json({error: error.message});
        return;
    }
    next();
}