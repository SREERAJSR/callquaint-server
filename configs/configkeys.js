"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function configKey() {
    return {
        PORT: process.env.PORT,
        ORIGIN: process.env.ORIGIN,
        MONGO_URL: process.env.MONGO_URL,
        DB_NAME: process.env.DB_NAME,
        BASE_URL: process.env.BASE_URL,
        HOST: process.env.HOST,
        SERVICE: process.env.SERVICE,
        MAIL: process.env.MAIL,
        PASS: process.env.PASS,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
        ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
        REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
        NODE_ENV: process.env.NODE_ENV,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        CLIENT_SSO_REDIRECT_URL: process.env.CLIENT_SSO_REDIRECT_URL,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
        RAZOR_PAY_KEY_ID: process.env.RAZOR_PAY_KEY_ID,
        RAZOR_PAY_SECRET_KEY: process.env.RAZOR_PAY_SECRET_KEY
    };
}
exports.default = configKey;
