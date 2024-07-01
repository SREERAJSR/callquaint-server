"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../../controller/admin.controller");
const user_validators_1 = require("../../validators/auth/user.validators");
const validateItems_1 = require("../../types/constants/validateItems");
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const chat_validator_1 = require("../../validators/chat/chat.validator");
const adminRoutes = () => {
    const router = (0, express_1.Router)();
    router.post('/login', (0, user_validators_1.authLoginSchemaValidator)(validateItems_1.validateItems.REQUEST_BODY), admin_controller_1.loginAdmin);
    router.post('/refreshToken', admin_controller_1.refreshAdminAccessToken);
    router.get("/dashboard", authMiddlewares_1.verifyAdminJWT, admin_controller_1.fetchDashBoardData);
    router.get('/users', authMiddlewares_1.verifyAdminJWT, admin_controller_1.fetchAllUsers);
    router.patch('/block-user/:userId', authMiddlewares_1.verifyAdminJWT, (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'userId'), admin_controller_1.blockUser);
    router.patch('/unblock-user/:userId', authMiddlewares_1.verifyAdminJWT, (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'userId'), admin_controller_1.unblockUser);
    router.get('/susbscriptions', authMiddlewares_1.verifyAdminJWT, admin_controller_1.getAllSubscriptonPlans)
        .post('/subscriptions', authMiddlewares_1.verifyAdminJWT, admin_controller_1.createSubscriptionPlan);
    router.get('/sales-report', authMiddlewares_1.verifyAdminJWT, (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.QUERY_STRING, 'date'), admin_controller_1.fetchSalesReports);
    router.post('/logout', authMiddlewares_1.verifyAdminJWT, admin_controller_1.logoutAdmin);
    return router;
};
exports.adminRoutes = adminRoutes;
