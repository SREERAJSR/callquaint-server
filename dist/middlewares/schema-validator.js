"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeSchemaValidator = exports.schemaValidator = void 0;
const joi_schema_1 = require("../schemas/joi.schema");
const http_statuscodes_1 = __importDefault(require("../types/http-statuscodes"));
// enum supportedMethods { "post", "put", "patch", "delete" }
const supportedMethods = ["get", "post", "put", "patch", "delete"];
const validationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
};
const validate = (useJoiError, validateItem, schema) => {
    return (req, res, next) => {
        let operation;
        if (validateItem === "REQUEST_BODY")
            operation = req.body;
        else if (validateItem === "ROUTE_PARAMS")
            operation = req.params;
        else if (validateItem === "QUERY_STRING")
            operation = req.query;
        const method = req.method.toLowerCase();
        if (!supportedMethods.includes(method))
            return next();
        const { error, value } = schema.validate(operation, validationOptions);
        if (error) {
            const customError = {
                status: "failed",
                error: "Invalid request. Please review request and try again."
            };
            const joiError = {
                status: 'failed',
                error: {
                    original: error === null || error === void 0 ? void 0 : error._original,
                    details: error === null || error === void 0 ? void 0 : error.details.map(({ message, type }) => ({
                        message: message.replace(/['"]/g, ""),
                        type: type
                    }))
                }
            };
            return res.status(http_statuscodes_1.default.UNPROCESSABLE_ENTITY).json(useJoiError ? joiError : customError);
        }
        if (validateItem === "REQUEST_BODY")
            req.body = value;
        else if (validateItem === "ROUTE_PARAMS")
            req.params = value;
        else if (validateItem === "QUERY_STRING")
            req.query = value;
        return next();
    };
};
const schemaValidator = (validateItem, useJoiError = true) => {
    return validate(useJoiError, validateItem, joi_schema_1.authSignup);
};
exports.schemaValidator = schemaValidator;
const routeSchemaValidator = (validateItem, useJoiError = true) => {
    console.log('here from route');
    return validate(useJoiError, validateItem, joi_schema_1.verifyRoute);
};
exports.routeSchemaValidator = routeSchemaValidator;
