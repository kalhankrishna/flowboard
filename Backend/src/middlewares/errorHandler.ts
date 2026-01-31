import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error);

    if(error instanceof jwt.TokenExpiredError){
        return res.status(401).json({error: "Token expired", code: "TOKEN_EXPIRED"});
    }

    if(error instanceof jwt.JsonWebTokenError){
        return res.status(401).json({error: "Invalid token", code: "INVALID_TOKEN"});
    }

    if(error instanceof jwt.NotBeforeError){
        return res.status(401).json({error: "Token not active", code: "INVALID_TOKEN"});
    }

    if(error instanceof Prisma.PrismaClientKnownRequestError){
        if(error.code === 'P2025'){
            return res.status(404).json({error: "Resource not found"});
        }
        if(error.code === 'P2002'){
            return res.status(409).json({error: "Resource already exists"});
        }
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            })),
        });
    }

    res.status(500).json({error: "Internal server error"});
}