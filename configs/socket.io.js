"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericEmitSocketEventFn = exports.emitSocketEvent = exports.initializeIo = void 0;
const cookie_1 = __importDefault(require("cookie"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const jsonwebtoken_1 = require("jsonwebtoken");
const configkeys_1 = __importDefault(require("./configkeys"));
const user_model_1 = __importDefault(require("../models/user.model"));
const socketEventEnums_1 = require("../types/constants/socketEventEnums");
let onlineUsers = new Map();
const emitOnlineUsersEvent = (io) => {
    io.emit(socketEventEnums_1.ChatEventEnum.ONLINEUSERS, Array.from(onlineUsers.values()));
};
const mountJoinEvent = (socket) => {
    socket.on(socketEventEnums_1.ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId);
        socket.join(chatId);
    });
};
const mountParticipantTypingEvent = (socket) => {
    socket.on(socketEventEnums_1.ChatEventEnum.TYPING_EVENT, (chatId) => {
        console.log(chatId, 'typing');
        socket.in(chatId).emit(socketEventEnums_1.ChatEventEnum.TYPING_EVENT, chatId);
    });
};
const mountParticipantStopTypingEvent = (socket) => {
    socket.on(socketEventEnums_1.ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
        console.log(chatId, 'notyping');
        socket.in(chatId).emit(socketEventEnums_1.ChatEventEnum.STOP_TYPING_EVENT, chatId);
    });
};
const mountGetOnlineUsersEvent = (socket) => {
    socket.on(socketEventEnums_1.ChatEventEnum.GETONLINEUSER, () => {
        socket.emit(socketEventEnums_1.ChatEventEnum.ONLINEUSERS, Array.from(onlineUsers.values()));
    });
};
const mountRequestCallEvent = (socket) => {
    socket.on(socketEventEnums_1.ChatEventEnum.CALL_REQUEST, (payload) => {
        console.log(payload);
        (0, exports.genericEmitSocketEventFn)(socket, payload.remoteId.toString(), socketEventEnums_1.ChatEventEnum.CALL_REQUEST, payload);
    });
};
const initializeIo = (io) => {
    return io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const cookies = cookie_1.default.parse(((_b = (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.cookie) || '');
            let token = cookies === null || cookies === void 0 ? void 0 : cookies.accessToken;
            if (!token)
                token = (_c = socket.handshake.auth) === null || _c === void 0 ? void 0 : _c.token;
            if (!token) {
                throw new AppError_1.default("Un-authorized handshake. Token is missing", http_statuscodes_1.default.UNAUTHORIZED);
            }
            const decodedToken = (0, jsonwebtoken_1.verify)(token, (0, configkeys_1.default)().ACCESS_TOKEN_SECRET);
            const user = yield user_model_1.default.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
            if (!user) {
                throw new AppError_1.default("Un-authorized handshake. Token is invalid", http_statuscodes_1.default.UNAUTHORIZED);
            }
            socket.user = user;
            socket.join(user === null || user === void 0 ? void 0 : user._id.toString());
            socket.emit(socketEventEnums_1.ChatEventEnum.CONNECTED_EVENT, 'connected');
            const userId = user === null || user === void 0 ? void 0 : user._id.toString();
            console.log('User connected 🗼. userId: ', user._id.toString());
            if (userId) {
                onlineUsers.set(userId, { userId: user._id.toString(), name: user.firstname });
            }
            emitOnlineUsersEvent(io);
            mountJoinEvent(socket);
            mountParticipantTypingEvent(socket);
            mountParticipantStopTypingEvent(socket);
            mountGetOnlineUsersEvent(socket);
            mountRequestCallEvent(socket);
            console.log(onlineUsers);
            socket.on(socketEventEnums_1.ChatEventEnum.DISCONNECT_EVENT, () => {
                var _a, _b;
                console.log("user has disconnected 🚫. userId: " + ((_a = socket.user) === null || _a === void 0 ? void 0 : _a._id));
                if ((_b = socket.user) === null || _b === void 0 ? void 0 : _b._id) {
                    onlineUsers.delete(socket.user._id.toString());
                    socket.leave(socket.user._id);
                }
                emitOnlineUsersEvent(io);
            });
        }
        catch (error) {
            socket.emit(socketEventEnums_1.ChatEventEnum.SOCKET_ERROR_EVENT, (error === null || error === void 0 ? void 0 : error.message) || "Something went wrong while connecting to the socket.");
        }
    }));
};
exports.initializeIo = initializeIo;
const emitSocketEvent = (req, roomId, event, payload) => {
    req.app.get('io').in(roomId).emit(event, payload);
};
exports.emitSocketEvent = emitSocketEvent;
const genericEmitSocketEventFn = (socket, roomId, event, payload) => {
    socket.in(roomId).emit(event, payload);
};
exports.genericEmitSocketEventFn = genericEmitSocketEventFn;
