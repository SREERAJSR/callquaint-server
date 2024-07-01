import express ,{ Application, Router} from "express";
import userRoutes from "./auth/user-auth.route";
import connectRoutes from "./connect/connect.routes";
import { chatRoutes } from "./chat/chat.routes";
import { messageRoutes } from "./chat/message.routes";
import { subscriptionRoutes } from "./subscription/subscription.routes";
import { adminRoutes } from "./admin/admin.route";


const routesConfig = (app: Application) => {
  app.use('/api/v1/user', userRoutes()),
    app.use('/api/v1/user/connect', connectRoutes()),
    app.use('/api/v1/user/chat', chatRoutes()),
    app.use('/api/v1/user/messages', messageRoutes()),
    app.use('/api/v1/user/subscriptions', subscriptionRoutes()),
    app.use('/api/v1/admin',adminRoutes())
}

export default routesConfig;
