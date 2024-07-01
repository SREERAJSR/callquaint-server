"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAcessTokenAndrefreshToken = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const generateAcessTokenAndrefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(userId);
        if (user) {
            const [accessToken, refreshToken] = yield Promise.all([user === null || user === void 0 ? void 0 : user.generateAccessToken(), user === null || user === void 0 ? void 0 : user.generateRefreshToken()]);
            user.refreshToken = refreshToken;
            yield user.save({ validateBeforeSave: false });
            return { accessToken, refreshToken };
        }
        else
            throw new AppError_1.default("User not exist in the givenId for generating accesstoken and refreshtoken", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default("Something went wrong while generating the accesstoken and refreshtoken", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
});
exports.generateAcessTokenAndrefreshToken = generateAcessTokenAndrefreshToken;
