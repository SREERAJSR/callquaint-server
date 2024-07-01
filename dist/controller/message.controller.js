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
exports.deleteMessage = exports.sendMessage = exports.getAllMessages = exports.getLocalPath = exports.getStaticPath = exports.chatMessageCommonAggregation = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const chat_model_1 = require("../models/chat.model");
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const mongoose_1 = __importDefault(require("mongoose"));
const message_model_1 = require("../models/message.model");
const ApiReponse_1 = __importDefault(require("../utils/ApiReponse"));
const socket_io_1 = require("../configs/socket.io");
const socketEventEnums_1 = require("../types/constants/socketEventEnums");
const chat_services_1 = require("../services/chat.services");
const chatMessageCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "sender",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            firstname: 1,
                            avatar: 1,
                            email: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                sender: { $first: "$sender" }
            }
        }
    ];
};
exports.chatMessageCommonAggregation = chatMessageCommonAggregation;
const getStaticPath = (req, fileName) => {
    return `${req.protocol}://${req.get('host')}/images/${fileName}`;
};
exports.getStaticPath = getStaticPath;
const getLocalPath = (fileName) => {
    return `public/images/${fileName}`;
};
exports.getLocalPath = getLocalPath;
exports.getAllMessages = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { chatId } = req.params;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const selectedChat = yield chat_model_1.Chat.findById(chatId);
    if (!selectedChat)
        throw new AppError_1.default("This chat doesn't exist", http_statuscodes_1.default.NOT_FOUND);
    if (!selectedChat.participants.includes(new mongoose_1.default.Types.ObjectId(_id))) {
        throw new AppError_1.default("user is not a part of this chat", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    const messages = yield message_model_1.ChatMessage.aggregate([
        {
            $match: {
                chat: new mongoose_1.default.Types.ObjectId(chatId)
            }
        },
        ...(0, exports.chatMessageCommonAggregation)(),
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, messages || [], 'Messages fetched succesfully'));
}));
exports.sendMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g;
    const reqF = req;
    const { chatId } = req.params;
    const _id = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const { content } = req.body;
    if (!content && !((_d = (_c = reqF.files) === null || _c === void 0 ? void 0 : _c.attachments) === null || _d === void 0 ? void 0 : _d.length)) {
        throw new AppError_1.default("Message content  or attachment is required", http_statuscodes_1.default.BAD_REQUEST);
    }
    const selectedChat = yield chat_model_1.Chat.findById(chatId);
    if (!selectedChat)
        throw new AppError_1.default("Chat does not exist", http_statuscodes_1.default.NOT_FOUND);
    const messageFiles = [];
    if (reqF.files && ((_f = (_e = reqF.files) === null || _e === void 0 ? void 0 : _e.attachments) === null || _f === void 0 ? void 0 : _f.length) > 0) {
        (_g = reqF.files.attachments) === null || _g === void 0 ? void 0 : _g.map((attachment) => {
            messageFiles.push({
                url: (0, exports.getStaticPath)(reqF, attachment.filename),
                localPath: (0, exports.getLocalPath)(attachment.filename)
            });
        });
    }
    const message = yield message_model_1.ChatMessage.create({
        sender: new mongoose_1.default.Types.ObjectId(_id),
        content: content || '',
        chat: new mongoose_1.default.Types.ObjectId(chatId),
        attachments: messageFiles
    });
    const chat = yield chat_model_1.Chat.findByIdAndUpdate(chatId, {
        $set: {
            lastMessage: message._id
        }
    }, { new: true });
    const messages = yield message_model_1.ChatMessage.aggregate([
        {
            $match: {
                _id: new mongoose_1.default.Types.ObjectId(message.id)
            }
        },
        ...(0, exports.chatMessageCommonAggregation)()
    ]);
    const recievedMessage = messages[0];
    if (!recievedMessage) {
        throw new AppError_1.default("Internal server error", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
    chat === null || chat === void 0 ? void 0 : chat.participants.forEach((participantObjectId) => {
        if (participantObjectId.toString() === (_id === null || _id === void 0 ? void 0 : _id.toString()))
            return;
        (0, socket_io_1.emitSocketEvent)(reqF, participantObjectId.toString(), socketEventEnums_1.ChatEventEnum.MESSAGE_RECEIVED_EVENT, recievedMessage);
    });
    res.status(http_statuscodes_1.default.CREATED).json(new ApiReponse_1.default(http_statuscodes_1.default.CREATED, recievedMessage, "messages saved sucessfully"));
}));
exports.deleteMessage = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const { chatId, messageId } = req.params;
    const _id = (_h = req.user) === null || _h === void 0 ? void 0 : _h._id;
    const chat = yield chat_model_1.Chat.findOne({
        _id: new mongoose_1.default.Types.ObjectId(chatId),
        participants: _id
    });
    if (!chat) {
        throw new AppError_1.default("Chat does not exist", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    const message = yield message_model_1.ChatMessage.findById(new mongoose_1.default.Types.ObjectId(messageId));
    if (!message) {
        throw new AppError_1.default("Message doesn't not exist", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    if (message.sender._id.toString() !== (_id === null || _id === void 0 ? void 0 : _id.toString())) {
        throw new AppError_1.default("You are not authorized to delete the message,you are not the sender", http_statuscodes_1.default.FORBIDDEN);
        return;
    }
    if (message.attachments.length > 0) {
        message.attachments.map((asset) => {
            (0, chat_services_1.removeLocalFile)(asset.localPath);
        });
    }
    yield message_model_1.ChatMessage.deleteOne({
        _id: new mongoose_1.default.Types.ObjectId(messageId)
    });
    if (chat.lastMessage.toString() === message._id.toString()) {
        const lastMessage = yield message_model_1.ChatMessage.findOne({ chat: new mongoose_1.default.Types.ObjectId(chatId) }, {}, { sort: { createdAt: -1 } });
        yield chat_model_1.Chat.findByIdAndUpdate(chatId, {
            lastMessage: lastMessage ? lastMessage.id : null
        });
    }
    chat.participants.forEach((participantObjectId) => {
        if (participantObjectId.toString() === _id.toString())
            return;
        (0, socket_io_1.emitSocketEvent)(req, participantObjectId.toString(), socketEventEnums_1.ChatEventEnum.MESSAGE_DELETE_EVENT, message);
    });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, message, "Message deleted succesfully"));
}));
