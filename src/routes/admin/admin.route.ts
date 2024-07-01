import { Router } from "express"
import {
    loginAdmin, fetchDashBoardData, fetchAllUsers, blockUser,unblockUser,
    createSubscriptionPlan, getAllSubscriptonPlans,fetchSalesReports,logoutAdmin,
    refreshAdminAccessToken
} from "../../controller/admin.controller";
import { authLoginSchemaValidator } from "../../validators/auth/user.validators";
import { validateItems } from "../../types/constants/validateItems";
import { verifyAdminJWT, verifyJWT } from "../../middlewares/authMiddlewares";
import { mongoIdPathVariableValidator } from "../../validators/chat/chat.validator";

export const adminRoutes = () => {
    const router = Router();
    router.post('/login', authLoginSchemaValidator(validateItems.REQUEST_BODY), loginAdmin)
    router.post('/refreshToken',refreshAdminAccessToken)
    router.get("/dashboard",verifyAdminJWT, fetchDashBoardData)
    router.get('/users',verifyAdminJWT, fetchAllUsers)
    router.patch('/block-user/:userId',verifyAdminJWT, mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'userId'), blockUser)
    router.patch('/unblock-user/:userId',verifyAdminJWT, mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'userId'), unblockUser)
    router.get('/susbscriptions',verifyAdminJWT,getAllSubscriptonPlans)
        .post('/subscriptions',verifyAdminJWT, createSubscriptionPlan)
    router.get('/sales-report',verifyAdminJWT,mongoIdPathVariableValidator(validateItems.QUERY_STRING,'date'),fetchSalesReports);
    router.post('/logout',verifyAdminJWT,logoutAdmin)
    return router
}