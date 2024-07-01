"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../controller/user.controller");
const user_validators_1 = require("../../validators/auth/user.validators");
const validateItems_1 = require("../../types/constants/validateItems");
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const multerMiddleware_1 = require("../../middlewares/multerMiddleware");
const common_constant_1 = require("../../types/constants/common.constant");
const chat_validator_1 = require("../../validators/chat/chat.validator");
const subscription_controller_1 = require("../../controller/subscription.controller");
const userRoutes = () => {
    const router = (0, express_1.Router)();
    router.post('/signup', (0, user_validators_1.authSingupSchemaValidator)(validateItems_1.validateItems.REQUEST_BODY), user_controller_1.signupUser);
    router.post('/login', (0, user_validators_1.authLoginSchemaValidator)(validateItems_1.validateItems.REQUEST_BODY), user_controller_1.loginUser);
    router.get('/verify/:verificationToken', (0, user_validators_1.routeSchemaValidator)(validateItems_1.validateItems.ROUTE_PARAMS), user_controller_1.verifyEmail);
    router.post('/refreshToken', user_controller_1.refreshAccessToken);
    router.post('/forgot-password', (0, user_validators_1.userForgotPasswordBodyValidator)(validateItems_1.validateItems.REQUEST_BODY), user_controller_1.forgotPasswordRequest);
    router.post('/reset-password/:resetToken', (0, user_validators_1.userResetPasswordTokenValidator)(validateItems_1.validateItems.ROUTE_PARAMS), (0, user_validators_1.userResetPasswordBodyValidator)(validateItems_1.validateItems.REQUEST_BODY), user_controller_1.resetPasswordRequest);
    router.post('/google', user_controller_1.handleSocialLogin),
        router.post('/setgender', authMiddlewares_1.verifyJWT, user_controller_1.setGenderForGoogleAuthUsers);
    router.post('/logout', authMiddlewares_1.verifyJWT, user_controller_1.logoutUser);
    router.get('/user-info', authMiddlewares_1.verifyJWT, user_controller_1.getUserInfo);
    router.patch('/edit-profile', authMiddlewares_1.verifyJWT, multerMiddleware_1.upload.single('avatar'), user_controller_1.editProfileInfo);
    router.get('/current-plan', authMiddlewares_1.verifyJWT, subscription_controller_1.getCurrentSubscriptionPlan);
    router.route('/assign-role/:userId').post(authMiddlewares_1.verifyJWT, (0, authMiddlewares_1.verifyPermission)([common_constant_1.UserRolesEnum.ADMIN]), (0, chat_validator_1.mongoIdPathVariableValidator)(validateItems_1.validateItems.ROUTE_PARAMS, 'userId'), user_controller_1.assignRole);
    return router;
};
exports.default = userRoutes;
