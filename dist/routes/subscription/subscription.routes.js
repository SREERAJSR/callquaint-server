"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRoutes = void 0;
const express_1 = require("express");
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const subscription_controller_1 = require("../../controller/subscription.controller");
const subscriptionRoutes = () => {
    const router = (0, express_1.Router)();
    router.use(authMiddlewares_1.verifyJWT);
    router.get('/', subscription_controller_1.getSubscriptionPlans);
    router.post('/createrazorPayOrder', subscription_controller_1.createOrder);
    router.post('/razorPayorderSuccess', subscription_controller_1.savePaymentInfoToDb);
    router.post('/razorPayorderSuccess', subscription_controller_1.saveFailedInfoToDb),
        router.post('/gpayPaymentSucess', subscription_controller_1.saveGpayTranscation);
    return router;
};
exports.subscriptionRoutes = subscriptionRoutes;
