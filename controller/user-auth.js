"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.verifyUser = exports.signupUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/http-statuscodes"));
const user_model_1 = __importDefault(require("../models/user-model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const signup_token_1 = __importDefault(require("../models/signup-token"));
const crypto = __importStar(require("crypto"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const create_email_1 = __importDefault(require("../utils/create-email"));
exports.signupUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, gender, password, confirm_password } = req.body;
    const user = yield user_model_1.default.findOne({ email: email });
    if (user)
        throw new AppError_1.default('This email is already associated with an account', http_statuscodes_1.default.BAD_REQUEST);
    const saltaround = 10;
    const hashedPassword = yield bcrypt_1.default.hash(password, saltaround);
    const newUser = yield new user_model_1.default({
        firstname: firstname,
        lastname: lastname,
        email: email,
        gender: gender,
        password: hashedPassword
    }).save();
    const token = yield new signup_token_1.default({
        userId: newUser._id,
        token: crypto.randomBytes(32).toString('hex')
    }).save();
    const message = `${(0, configkeys_1.default)().BASE_URL}/verify/${newUser.id}/${token.token}`;
    yield (0, create_email_1.default)(email, 'verify email', message);
    res.status(http_statuscodes_1.default.OK).send("An Email sent to your account please verify");
}));
exports.verifyUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.default.findById(id);
    if (!user)
        return res.status(400).send("Invalid link");
    const token = yield signup_token_1.default.findOne({
        userId: user._id,
        token: req.params.token,
    });
    if (!token)
        return res.status(400).send("Invalid link");
    yield user_model_1.default.updateOne({ _id: user._id, verified: true });
    yield signup_token_1.default.findByIdAndDelete(token._id);
    res.send("email verified sucessfully");
}));
