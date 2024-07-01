import { Router } from "express"
import {
    acceptFriendRequest, callSetup, fetchFriendRequestsFromDb,
    fetchFriendsList, getCallHistory, getChannelName, rejectFriendRequest,
    saveCallInfoToDb, sendFriendRequest,removeListener
} from "../../controller/connect.controller";
import { verifyJWT } from "../../middlewares/authMiddlewares";

const connectRoutes = () => { 
    const router = Router();
    router.use(verifyJWT)
    router.get('/call', callSetup),
        router.delete('/removeFromListening',removeListener)
        router.post('/saveCallInfo',  saveCallInfoToDb),
        router.get('/callhistory',  getCallHistory),
        router.post('/sendfriendrequest', sendFriendRequest),
        router.get("/getfriendrequests", fetchFriendRequestsFromDb),
        router.patch('/acceptrequest',  acceptFriendRequest),
        router.delete('/rejectfriendrequest', rejectFriendRequest),
        router.get('/getFriends', fetchFriendsList),
        router.get('/call/getChannelName',getChannelName)
    return router;
}

export default connectRoutes;