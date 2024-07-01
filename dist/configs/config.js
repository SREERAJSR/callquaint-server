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
        DB_NAME: process.env.DB_NAME
    };
}
exports.default = configKey;
