"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatEventEnum = void 0;
var ChatEventEnum;
(function (ChatEventEnum) {
    // ? once user is ready to go
    ChatEventEnum["CONNECTED_EVENT"] = "connected";
    // ? when user gets disconnected
    ChatEventEnum["DISCONNECT_EVENT"] = "disconnect";
    // ? when user joins a socket room
    ChatEventEnum["JOIN_CHAT_EVENT"] = "joinChat";
    // ? when participant gets removed from group, chat gets deleted or leaves a group
    ChatEventEnum["LEAVE_CHAT_EVENT"] = "leaveChat";
    // ? when admin updates a group name
    ChatEventEnum["UPDATE_GROUP_NAME_EVENT"] = "updateGroupName";
    // ? when new message is received
    ChatEventEnum["MESSAGE_RECEIVED_EVENT"] = "messageReceived";
    // ? when there is new one on one chat, new group chat or user gets added in the group
    ChatEventEnum["NEW_CHAT_EVENT"] = "newChat";
    // ? when there is an error in socket
    ChatEventEnum["SOCKET_ERROR_EVENT"] = "socketError";
    // ? when participant stops typing
    ChatEventEnum["STOP_TYPING_EVENT"] = "stopTyping";
    // ? when participant starts typing
    ChatEventEnum["TYPING_EVENT"] = "typing";
    // ? when message is deleted
    ChatEventEnum["MESSAGE_DELETE_EVENT"] = "messageDeleted";
    ChatEventEnum["ONLINEUSERS"] = "onlineUsers";
    ChatEventEnum["GETONLINEUSER"] = "getOnlineUsers";
    ChatEventEnum["CALL_REQUEST"] = "callRequest";
    ChatEventEnum["ACCEPT_CALL"] = "acceptCall";
    ChatEventEnum["DECLINE_CALL"] = "declineCall";
})(ChatEventEnum || (exports.ChatEventEnum = ChatEventEnum = {}));
