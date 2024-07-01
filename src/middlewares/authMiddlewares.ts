import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import AppError from "../utils/AppError";
import HttpStatus from "../types/constants/http-statuscodes";
import jwt, { JwtPayload } from 'jsonwebtoken';
import configKey from "../configs/configkeys";
import User from "../models/user.model";
import { UserDocument } from "../types/model/usermodel.interface";
import mongoose, { Document } from "mongoose";
import { UserRolesEnum } from "../types/constants/common.constant";
import { AdminCustomRequest } from "../types/interfaces/common.interface";

export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token =  req.cookies?.accessToken?.trim() || req.header("authorization")?.replace("Bearer","").trim();
    if (!token) throw new AppError("Unauthorized request", HttpStatus.UNAUTHORIZED);
    try {
        
        const secret = configKey().ACCESS_TOKEN_SECRET;
        const decodedToken =  jwt.verify(token,secret) as JwtPayload ;    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")
        if (!user) throw new AppError("Invalid access token", HttpStatus.UNAUTHORIZED);
        req.user = user;
        next()
    } catch (error:any) {
            throw new AppError( error?.message || "Invalid access token",HttpStatus.UNAUTHORIZED);
    }
})


export const verifyAdminJWT = asyncHandler(async (req:any, res: Response, next: NextFunction) => {
    const token =  req.cookies?.accessToken?.trim()   || req.header("authorization")?.replace("Bearer","").trim();
    if (!token) throw new AppError("Unauthorized request", HttpStatus.UNAUTHORIZED);
    try {
        
        const secret = configKey().ACCESS_TOKEN_SECRET;
        const decodedToken =  jwt.verify(token,secret) as JwtPayload ;    
        const admin = await User.findOne({
            _id: new mongoose.Types.ObjectId(decodedToken?._id),
            role:UserRolesEnum.ADMIN
        }).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry") as Document
        if (!admin) throw new AppError("Invalid access token", HttpStatus.UNAUTHORIZED);
        req.admin = admin;
        next()
    } catch (error:any) {
            throw new AppError( error?.message || "Invalid access token",HttpStatus.UNAUTHORIZED);
    }
})



export const verifyPermission = (roles:string [] =[]) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?._id) {
            throw new AppError("Unauthorized request",HttpStatus.UNAUTHORIZED)
        }
        const userDoc =req?.user as UserDocument
        if (roles.includes(userDoc.role)) {
        next()
        }
        throw new AppError("You are not allowed for this action",HttpStatus.FORBIDDEN)
    })
}