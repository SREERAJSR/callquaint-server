import dotenv from 'dotenv'
import {configTypes} from '../types/config-types';
dotenv.config();

function configKey():configTypes {
    return {
        PORT: process.env.PORT as string,
        ORIGIN: process.env.ORIGIN as string,
        MONGO_URL: process.env.MONGO_URL as string,
        DB_NAME: process.env.DB_NAME as string,
        BASE_URL: process.env.BASE_URL as string,
        HOST: process.env.HOST as string,
        SERVICE: process.env.SERVICE as string,
        MAIL: process.env.MAIL as string, 
        PASS: process.env.PASS as string,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY as string,
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string, 
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
        REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as string, 
        NODE_ENV: process.env.NODE_ENV as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        CLIENT_SSO_REDIRECT_URL: process.env.CLIENT_SSO_REDIRECT_URL as string,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
        GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL as string,
        RAZOR_PAY_KEY_ID: process.env.RAZOR_PAY_KEY_ID as string,
        RAZOR_PAY_SECRET_KEY:process.env.RAZOR_PAY_SECRET_KEY as string
    }
}

export  default   configKey