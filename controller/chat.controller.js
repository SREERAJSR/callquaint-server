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
exports.deleteOneOnOneChat = exports.searchAvailableUsers = exports.createOrGetAOneOnOneChat = exports.getAllChat = exports.chatCommonAggregation = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const chat_model_1 = require("../models/chat.model");
const mongoose_1 = __importDefault(require("mongoose"));
const ApiReponse_1 = __importDefault(require("../utils/ApiReponse"));
const socket_io_1 = require("../configs/socket.io");
const socketEventEnums_1 = require("../types/constants/socketEventEnums");
const message_model_1 = require("../models/message.model");
const chat_services_1 = require("../services/chat.services");
const chatCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "participants",
                as: "participants",
                pipeline: [
                    {
                        $project: {
                            password: 0,
                            refreshToken: 0,
                            forgotPasswordToken: 0,
                            forgotPasswordExpiry: 0,
                            emailVerificationToken: 0,
                            emailVerificationExpiry: 0,
                            friends: 0,
                            channelName: 0,
                            requestSend: 0,
                            requests: 0,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "chatmessages",
                foreignField: "_id",
                localField: "lastMessage",
                as: "lastMessage",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "sender",
                            as: "sender",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        email: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            sender: { $first: "$sender" },
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                lastMessage: { $first: "$lastMessage" },
            },
        },
    ];
};
exports.chatCommonAggregation = chatCommonAggregation;
const deleteCascadeChatMessage = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield message_model_1.ChatMessage.find({
        chat: new mongoose_1.default.Types.ObjectId(chatId)
    });
    let attachments = [];
    attachments = attachments.concat(...messages.map((message) => message.attachments));
    attachments.forEach((attachment) => {
        (0, chat_services_1.removeLocalFile)(attachment.localPath);
    });
    yield message_model_1.ChatMessage.deleteMany({
        chat: new mongoose_1.default.Types.ObjectId(chatId)
    });
});
exports.getAllChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const chats = yield chat_model_1.Chat.aggregate([
        {
            $match: {
                participants: { $elemMatch: { $eq: userId } }
            },
        }, {
            $sort: {
                updatedAt: -1
            }
        },
        ...(0, exports.chatCommonAggregation)()
    ]);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, chats || [], "Users chats fetched sucessfully"));
}));
exports.createOrGetAOneOnOneChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { recieverId } = req.params;
    const _id = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const reciever = yield user_model_1.default.findById(recieverId);
    if (!reciever) {
        throw new AppError_1.default("Reciever doesn't exist", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    if (reciever._id.toString() === (_id === null || _id === void 0 ? void 0 : _id.toString())) {
        throw new AppError_1.default("You cannot chat yourselft", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    const chat = yield chat_model_1.Chat.aggregate([
        {
            $match: {
                isGroupChat: false,
                $and: [
                    {
                        participants: { $elemMatch: { $eq: _id } }
                    },
                    {
                        participants: { $elemMatch: { $eq: new mongoose_1.default.Types.ObjectId(recieverId) } }
                    }
                ]
            }
        }, ...(0, exports.chatCommonAggregation)()
    ]);
    if (chat.length) {
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, chat[0], "chat retrived successfully"));
        return;
    }
    const newChatInstance = yield chat_model_1.Chat.create({
        name: "One on One chat",
        participants: [_id, new mongoose_1.default.Types.ObjectId(recieverId)],
        admin: _id
    });
    const createdChat = yield chat_model_1.Chat.aggregate([
        {
            $match: {
                _id: newChatInstance._id
            }
        },
        ...(0, exports.chatCommonAggregation)()
    ]);
    const payload = createdChat[0];
    if (!payload) {
        throw new AppError_1.default("Internal server error", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
        return;
    }
    (_c = payload === null || payload === void 0 ? void 0 : payload.participants) === null || _c === void 0 ? void 0 : _c.forEach((participant) => {
        var _a;
        if (participant._id.toString() === (_id === null || _id === void 0 ? void 0 : _id.toString())) {
            return;
        }
        (0, socket_io_1.emitSocketEvent)(req, (_a = participant === null || participant === void 0 ? void 0 : participant._id) === null || _a === void 0 ? void 0 : _a.toString(), socketEventEnums_1.ChatEventEnum.NEW_CHAT_EVENT, payload);
    });
    res.status(http_statuscodes_1.default.CREATED).json(new ApiReponse_1.default(http_statuscodes_1.default.CREATED, payload, "chat retrived sucesfully"));
}));
exports.searchAvailableUsers = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const user_id = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const friendsData = yield user_model_1.default.aggregate([
        {
            $match: {
                _id: { $eq: user_id }
            }
        }, {
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "friends",
                as: "friends",
                pipeline: [
                    {
                        $project: {
                            firstname: 1,
                            avatar: 1,
                            email: 1,
                        }
                    }
                ]
            }
        }, {
            $project: {
                friends: 1
            }
        }
    ]);
    const friends = friendsData[0];
    console.log(friends);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, friends, 'friends data fetched succesfully'));
}));
exports.deleteOneOnOneChat = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { chatId } = req.params;
    console.log(chatId);
    const _id = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
    const chat = yield chat_model_1.Chat.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(chatId)
            },
        }, ...(0, exports.chatCommonAggregation)()
    ]);
    const payload = chat[0];
    if (!payload) {
        throw new AppError_1.default("Chat doesnot exist", http_statuscodes_1.default.NOT_FOUND);
    }
    yield chat_model_1.Chat.findByIdAndDelete(chatId);
    yield deleteCascadeChatMessage(chatId);
    const participants = payload.participants;
    const otherParticipant = participants.find(((participant) => (participant === null || participant === void 0 ? void 0 : participant._id.toString()) !== (_id === null || _id === void 0 ? void 0 : _id.toString())));
    console.log(otherParticipant);
    (0, socket_io_1.emitSocketEvent)(req, otherParticipant === null || otherParticipant === void 0 ? void 0 : otherParticipant._id.toString(), socketEventEnums_1.ChatEventEnum.LEAVE_CHAT_EVENT, payload);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, 'Chat deletedSucessfully'));
}));
