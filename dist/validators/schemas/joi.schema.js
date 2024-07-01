"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoIdPathVariableValidatorSchemaFn = exports.resetPasswordBodySchema = exports.resetPasswordTokenSchema = exports.forgotPasswordSchema = exports.authLoginSchema = exports.verifyRouteSchema = exports.authSignupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const PASSWORD_REGEX = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!.@#$%^&*])(?=.{8,})");
exports.authSignupSchema = joi_1.default.object({
    firstname: joi_1.default.string().alphanum().min(3).max(30).required(),
    lastname: joi_1.default.string().max(30).required(),
    gender: joi_1.default.string().required(),
    email: joi_1.default.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi_1.default.string().pattern(PASSWORD_REGEX).min(8).required(),
    confirm_password: joi_1.default.ref('password')
});
exports.verifyRouteSchema = joi_1.default.object({
    verificationToken: joi_1.default.string().required()
});
exports.authLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi_1.default.string().pattern(PASSWORD_REGEX).min(8).required(),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
});
exports.resetPasswordTokenSchema = joi_1.default.object({
    resetToken: joi_1.default.string().required()
});
exports.resetPasswordBodySchema = joi_1.default.object({
    password: joi_1.default.string().pattern(PASSWORD_REGEX).min(8).required(),
    confirm_password: joi_1.default.ref('password')
});
const mongoIdPathVariableValidatorSchemaFn = (path) => {
    return joi_1.default.object({
        [path]: joi_1.default.string().required()
    });
};
exports.mongoIdPathVariableValidatorSchemaFn = mongoIdPathVariableValidatorSchemaFn;
