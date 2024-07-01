import { Router } from "express"
import { verifyJWT } from "../../middlewares/authMiddlewares";
import { createOrder, getSubscriptionPlans, savePaymentInfoToDb,saveFailedInfoToDb, saveGpayTranscation } from "../../controller/subscription.controller";


export const subscriptionRoutes = () => {
    const router = Router();
    router.use(verifyJWT)
    router.get('/',getSubscriptionPlans)
        router.post('/createrazorPayOrder',createOrder)
    router.post('/razorPayorderSuccess', savePaymentInfoToDb)
    router.post('/razorPayorderSuccess', saveFailedInfoToDb),
    router.post('/gpayPaymentSucess',saveGpayTranscation)
    return router;
}