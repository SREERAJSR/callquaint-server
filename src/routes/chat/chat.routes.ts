import { Router } from "express"
import { mongoIdPathVariableValidator } from "../../validators/chat/chat.validator";
import { validateItems } from "../../types/constants/validateItems";
import { createOrGetAOneOnOneChat, getAllChat, searchAvailableUsers,deleteOneOnOneChat } from "../../controller/chat.controller";
import { verifyJWT } from "../../middlewares/authMiddlewares";

export const chatRoutes = () => {

    const router = Router();
    router.use(verifyJWT)
    router.
        post('/c/:recieverId',
            mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'recieverId'),
            createOrGetAOneOnOneChat),
        router.get('/', getAllChat),
        router.get('/users', searchAvailableUsers), 
        router.delete('/remove/:chatId', mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'chatId'), deleteOneOnOneChat)

    return router;
}