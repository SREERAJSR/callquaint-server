"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_auth_route_1 = __importDefault(require("./auth/user-auth.route"));
const connect_routes_1 = __importDefault(require("./connect/connect.routes"));
const chat_routes_1 = require("./chat/chat.routes");
const message_routes_1 = require("./chat/message.routes");
const subscription_routes_1 = require("./subscription/subscription.routes");
const admin_route_1 = require("./admin/admin.route");
const routesConfig = (app) => {
    app.use('/api/v1/user', (0, user_auth_route_1.default)()),
        app.use('/api/v1/user/connect', (0, connect_routes_1.default)()),
        app.use('/api/v1/user/chat', (0, chat_routes_1.chatRoutes)()),
        app.use('/api/v1/user/messages', (0, message_routes_1.messageRoutes)()),
        app.use('/api/v1/user/subscriptions', (0, subscription_routes_1.subscriptionRoutes)()),
        app.use('/api/v1/admin', (0, admin_route_1.adminRoutes)());
};
exports.default = routesConfig;
