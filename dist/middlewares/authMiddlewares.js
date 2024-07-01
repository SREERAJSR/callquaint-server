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
exports.verifyPermission = exports.verifyAdminJWT = exports.verifyJWT = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const user_model_1 = __importDefault(require("../models/user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const common_constant_1 = require("../types/constants/common.constant");
exports.verifyJWT = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const token = ((_b = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) === null || _b === void 0 ? void 0 : _b.trim()) || ((_c = req.header("authorization")) === null || _c === void 0 ? void 0 : _c.replace("Bearer", "").trim());
    if (!token)
        throw new AppError_1.default("Unauthorized request", http_statuscodes_1.default.UNAUTHORIZED);
    try {
        const secret = (0, configkeys_1.default)().ACCESS_TOKEN_SECRET;
        const decodedToken = jsonwebtoken_1.default.verify(token, secret);
        const user = yield user_model_1.default.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
        if (!user)
            throw new AppError_1.default("Invalid access token", http_statuscodes_1.default.UNAUTHORIZED);
        req.user = user;
        next();
    }
    catch (error) {
        throw new AppError_1.default((error === null || error === void 0 ? void 0 : error.message) || "Invalid access token", http_statuscodes_1.default.UNAUTHORIZED);
    }
}));
exports.verifyAdminJWT = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    const token = ((_e = (_d = req.cookies) === null || _d === void 0 ? void 0 : _d.accessToken) === null || _e === void 0 ? void 0 : _e.trim()) || ((_f = req.header("authorization")) === null || _f === void 0 ? void 0 : _f.replace("Bearer", "").trim());
    if (!token)
        throw new AppError_1.default("Unauthorized request", http_statuscodes_1.default.UNAUTHORIZED);
    try {
        const secret = (0, configkeys_1.default)().ACCESS_TOKEN_SECRET;
        const decodedToken = jsonwebtoken_1.default.verify(token, secret);
        const admin = yield user_model_1.default.findOne({
            _id: new mongoose_1.default.Types.ObjectId(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id),
            role: common_constant_1.UserRolesEnum.ADMIN
        }).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
        if (!admin)
            throw new AppError_1.default("Invalid access token", http_statuscodes_1.default.UNAUTHORIZED);
        req.admin = admin;
        next();
    }
    catch (error) {
        throw new AppError_1.default((error === null || error === void 0 ? void 0 : error.message) || "Invalid access token", http_statuscodes_1.default.UNAUTHORIZED);
    }
}));
const verifyPermission = (roles = []) => {
    return (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            throw new AppError_1.default("Unauthorized request", http_statuscodes_1.default.UNAUTHORIZED);
        }
        const userDoc = req === null || req === void 0 ? void 0 : req.user;
        if (roles.includes(userDoc.role)) {
            next();
        }
        throw new AppError_1.default("You are not allowed for this action", http_statuscodes_1.default.FORBIDDEN);
    }));
};
exports.verifyPermission = verifyPermission;
