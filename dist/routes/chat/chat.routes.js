"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const chat_validator_1 = require("../../validators/chat/chat.validator");
const validateItems_1 = require("../../types/constants/validateItems");
const chat_controller_1 = require("../../controller/chat.controller");
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const chatRoutes = () => {
    const router = (0, express_1.Router)();
    router.use(authMiddlewares_1.verifyJWT);
    router.
        post('/c/:recieverId', (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'recieverId'), chat_controller_1.createOrGetAOneOnOneChat),
        router.get('/', chat_controller_1.getAllChat),
        router.get('/users', chat_controller_1.searchAvailableUsers),
        router.delete('/remove/:chatId', (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'chatId'), chat_controller_1.deleteOneOnOneChat);
    return router;
};
exports.chatRoutes = chatRoutes;
