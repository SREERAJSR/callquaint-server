import { ObjectId } from "mongodb"
import User from "../models/user.model"
import { AccessTokenAndrefreshTokenInterface } from "../types/app.interfaces"
import AppError from "../utils/AppError"
import HttpStatus from "../types/constants/http-statuscodes"
import mongoose from "mongoose"
import asyncHandler from "express-async-handler"
import { UserDocument } from "../types/model/usermodel.interface"




export const generateAcessTokenAndrefreshToken = async (userId: string | undefined): Promise<AccessTokenAndrefreshTokenInterface> => {
    try {
        const user = await User.findById(userId)
        if (user) {
            const [accessToken, refreshToken] = await Promise.all([user?.generateAccessToken(), user?.generateRefreshToken()])
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken }
        } else throw new AppError("User not exist in the givenId for generating accesstoken and refreshtoken", HttpStatus.INTERNAL_SERVER_ERROR);
    } catch (error) {
        console.log(error)
        throw new AppError("Something went wrong while generating the accesstoken and refreshtoken", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

