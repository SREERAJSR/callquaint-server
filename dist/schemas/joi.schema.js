"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRoute = exports.authSignup = void 0;
const joi_1 = __importDefault(require("joi"));
const PASSWORD_REGEX = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})");
exports.authSignup = joi_1.default.object({
    firstname: joi_1.default.string().alphanum().min(3).max(30).required(),
    lastname: joi_1.default.string().alphanum().max(30).required(),
    email: joi_1.default.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    gender: joi_1.default.string().required(),
    password: joi_1.default.string().pattern(PASSWORD_REGEX).min(8).required(),
    confirm_password: joi_1.default.ref('password')
});
exports.verifyRoute = joi_1.default.object({
    id: joi_1.default.string().required(),
    token: joi_1.default.string().required()
});
