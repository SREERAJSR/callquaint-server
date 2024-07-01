"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connect_controller_1 = require("../../controller/connect.controller");
const authMiddlewares_1 = require("../../middlewares/authMiddlewares");
const connectRoutes = () => {
    const router = (0, express_1.Router)();
    router.use(authMiddlewares_1.verifyJWT);
    router.get('/call', connect_controller_1.callSetup),
        router.delete('/removeFromListening', connect_controller_1.removeListener);
    router.post('/saveCallInfo', connect_controller_1.saveCallInfoToDb),
        router.get('/callhistory', connect_controller_1.getCallHistory),
        router.post('/sendfriendrequest', connect_controller_1.sendFriendRequest),
        router.get("/getfriendrequests", connect_controller_1.fetchFriendRequestsFromDb),
        router.patch('/acceptrequest', connect_controller_1.acceptFriendRequest),
        router.delete('/rejectfriendrequest', connect_controller_1.rejectFriendRequest),
        router.get('/getFriends', connect_controller_1.fetchFriendsList),
        router.get('/call/getChannelName', connect_controller_1.getChannelName);
    return router;
};
exports.default = connectRoutes;
