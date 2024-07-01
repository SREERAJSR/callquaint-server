"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_auth_1 = require("../controller/user-auth");
const schema_validator_1 = require("../middlewares/schema-validator");
const schema_types_1 = require("../types/schema.types");
const userRoutes = () => {
    const router = (0, express_1.Router)();
    router.post('/signup', (0, schema_validator_1.schemaValidator)(schema_types_1.validateItems.REQUEST_BODY), user_auth_1.signupUser);
    router.get('/verify/:id/:token', (0, schema_validator_1.routeSchemaValidator)(schema_types_1.validateItems.ROUTE_PARAMS), user_auth_1.verifyUser);
    return router;
};
exports.default = userRoutes;
