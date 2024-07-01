"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = void 0;
const express_1 = require("express");
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const chat_validator_1 = require("../../validators/chat/chat.validator");
const validateItems_1 = require("../../types/constants/validateItems");
const message_controller_1 = require("../../controller/message.controller");
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const router = (0, express_1.Router)();
const messageRoutes = () => {
    router.use(authMiddlewares_1.verifyJWT);
    router.get('/:chatId', (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'chatId'), message_controller_1.getAllMessages)
        .post('/:chatId', multerMiddleware_1.upload.fields([{ name: "attachments", maxCount: 5 }]), (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'chatId'), (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.REQUEST_BODY, 'content'), message_controller_1.sendMessage),
        router.delete('/:chatId/:messageId', 
        // mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'chatId'),
        // mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'messageId'),
        message_controller_1.deleteMessage);
    return router;
};
exports.messageRoutes = messageRoutes;
