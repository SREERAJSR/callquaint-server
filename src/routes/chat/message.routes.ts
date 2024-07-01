
import { Router } from "express";
import { verifyJWT } from "../../middlewares/authMiddlewares";
import { mongoIdPathVariableValidator } from "../../validators/chat/chat.validator";
import { validateItems } from "../../types/constants/validateItems";
import { getAllMessages, sendMessage ,deleteMessage} from "../../controller/message.controller";
import { upload } from "../../middlewares/multerMiddleware";

const router = Router();

export const messageRoutes = () => {
    router.use(verifyJWT)

    router.get('/:chatId', mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'chatId'), getAllMessages)
        .post('/:chatId', upload.fields([{ name: "attachments", maxCount: 5 }])
            , mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'chatId')
            , mongoIdPathVariableValidator(validateItems.REQUEST_BODY, 'content'), sendMessage),
        router.delete('/:chatId/:messageId',
            // mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'chatId'),
            // mongoIdPathVariableValidator(validateItems.ROUTE_PARAMS, 'messageId'),
            deleteMessage
        )
    return router
}