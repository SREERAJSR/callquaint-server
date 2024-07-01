import { Request, Response, Router } from "express";
import {
    loginUser, signupUser, verifyEmail, refreshAccessToken,
    forgotPasswordRequest, resetPasswordRequest,handleSocialLogin,
    logoutUser,
    setGenderForGoogleAuthUsers,getUserInfo,editProfileInfo,assignRole
} from "../../controller/user.controller";
import {
    routeSchemaValidator, authSingupSchemaValidator,
    authLoginSchemaValidator, userForgotPasswordBodyValidator,
    userResetPasswordTokenValidator, userResetPasswordBodyValidator,
} from "../../validators/auth/user.validators";
import { validateItems } from "../../types/constants/validateItems";
import passport from "passport";
import { verifyJWT, verifyPermission } from "../../middlewares/authMiddlewares";
import { upload } from "../../middlewares/multerMiddleware";
import { UserRolesEnum } from "../../types/constants/common.constant";
import { mongoIdPathVariableValidator } from "../../validators/chat/chat.validator";
import { getCurrentSubscriptionPlan } from "../../controller/subscription.controller";
 

const userRoutes = () => {
    const router = Router();
    router.post('/signup', authSingupSchemaValidator(validateItems.REQUEST_BODY), signupUser)
    router.post('/login',authLoginSchemaValidator(validateItems.REQUEST_BODY),loginUser)
    router.get('/verify/:verificationToken', routeSchemaValidator(validateItems.ROUTE_PARAMS), verifyEmail)
    router.post('/refreshToken', refreshAccessToken)
    router.post('/forgot-password', userForgotPasswordBodyValidator(validateItems.REQUEST_BODY), forgotPasswordRequest)
    router.post('/reset-password/:resetToken',
        userResetPasswordTokenValidator(validateItems.ROUTE_PARAMS),
        userResetPasswordBodyValidator(validateItems.REQUEST_BODY),resetPasswordRequest)
    router.post('/google', handleSocialLogin),
    router.post('/setgender',verifyJWT,setGenderForGoogleAuthUsers)
    router.post('/logout', verifyJWT, logoutUser)
    router.get('/user-info', verifyJWT, getUserInfo)
    router.patch('/edit-profile', verifyJWT, upload.single('avatar'), editProfileInfo)
    router.get('/current-plan',verifyJWT,getCurrentSubscriptionPlan)
    router.route('/assign-role/:userId').post(verifyJWT, verifyPermission([UserRolesEnum.ADMIN]),
        mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS,'userId'),assignRole)
    return router
}  
 
export default userRoutes; 