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
exports.getChannelName = exports.fetchFriendsList = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.fetchFriendRequestsFromDb = exports.sendFriendRequest = exports.getCallHistory = exports.saveCallInfoToDb = exports.removeListener = exports.callSetup = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const ApiReponse_1 = __importDefault(require("../utils/ApiReponse"));
const common_constant_1 = require("../types/constants/common.constant");
const callInfo_model_1 = __importDefault(require("../models/callInfo.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const selfHost = new Set();
exports.callSetup = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req.query);
    const { target } = req.query;
    const userid = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const user = yield user_model_1.default.findById(userid);
    if (!user)
        throw new AppError_1.default("unauthorized", http_statuscodes_1.default.UNAUTHORIZED);
    const userObject = { channelName: user.channelName, gender: user.gender, target: target };
    if (target === common_constant_1.ConnectTargetEnums.ANY) {
        const matchedAnyUsers = getRandomUsersByAnyTarget(target, userObject);
        console.log(matchedAnyUsers, 'match match match');
        if (matchedAnyUsers.length > 0) {
            const randomRemoteUser = getRandomUser(matchedAnyUsers);
            selfHost.delete(randomRemoteUser);
            res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, randomRemoteUser, 'user got a remote user'));
            res.end();
            return; // Early return to prevent further execution
        }
    }
    else if (target === common_constant_1.ConnectTargetEnums.MALE || target === common_constant_1.ConnectTargetEnums.FEMALE) {
        const matchedTargetUsers = getRandomUsersByTarget(target, userObject);
        if (matchedTargetUsers.length > 0) {
            const randomRemoteUser = getRandomUser(matchedTargetUsers);
            selfHost.delete(randomRemoteUser);
            res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, randomRemoteUser, 'user got a remote user'));
            res.end();
            return; // Early return c
        }
    }
    // If no target user is found
    selfHost.add(userObject);
    console.log(selfHost);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, userObject, 'user is self hosted'));
    res.end();
}));
exports.removeListener = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const _id = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(_id));
    const channelName = user === null || user === void 0 ? void 0 : user.channelName.toString();
    if (!channelName) {
        throw new AppError_1.default("Channel name not found", http_statuscodes_1.default.BAD_REQUEST);
    }
    let userToRemove = null;
    for (let user of selfHost) {
        if (user.channelName.toString() === (channelName === null || channelName === void 0 ? void 0 : channelName.toString())) {
            userToRemove = user;
            break;
        }
    }
    if (userToRemove) {
        selfHost.delete(userToRemove);
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, 'user removed from selfhosted'));
    }
    else {
        res.status(http_statuscodes_1.default.NOT_FOUND).json(new ApiReponse_1.default(http_statuscodes_1.default.NOT_FOUND, {}, 'user Not found in selfhost '));
    }
}));
exports.saveCallInfoToDb = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { remoteId, duration, date } = req.body;
    const formattedDuration = secondsToTimeString(Number(duration));
    const _id = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    const user = yield user_model_1.default.findById(_id);
    if (!user)
        throw new AppError_1.default("unauthorized", http_statuscodes_1.default.UNAUTHORIZED);
    const existedCallInfo = yield callInfo_model_1.default.findOne({ userId: _id });
    if (!existedCallInfo) {
        const newCallInfo = new callInfo_model_1.default({
            userId: _id,
            callInfo: []
        });
        newCallInfo.callInfo.push({ remoteUserId: remoteId, callDuration: formattedDuration, date: date });
        yield newCallInfo.save({ validateBeforeSave: false });
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "callinformation updated"));
        return;
    }
    else {
        let isRequestSent = false;
        existedCallInfo.callInfo.forEach((info) => {
            if (info.remoteUserId.toString() === remoteId.toString() && info.requestSent === true) {
                isRequestSent = true;
            }
        });
        existedCallInfo.callInfo.push({ remoteUserId: remoteId, callDuration: formattedDuration, date: date, requestSent: isRequestSent });
        yield existedCallInfo.save({ validateBeforeSave: false });
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "callinformation updated"));
        return;
    }
}));
exports.getCallHistory = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const _id = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const existedCallInfo = yield callInfo_model_1.default.findOne({ userId: _id }).populate('callInfo.remoteUserId', 'firstname lastname ');
    if (!existedCallInfo) {
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, [], 'No call history found for this user'));
        return;
    }
    let callhistory = [...existedCallInfo.callInfo];
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(_id)).select('friends');
    const friendsSet = new Set(user === null || user === void 0 ? void 0 : user.friends.map((friend) => friend.toString()));
    callhistory.forEach((history) => {
        const remoteUserId = history.remoteUserId._id.toString();
        console.log(friendsSet.has(remoteUserId));
        if (friendsSet.has(remoteUserId)) {
            history.friend = true;
        }
        else {
            history.friend = false;
        }
    });
    callhistory.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
    });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, callhistory, 'call history recieved'));
}));
exports.sendFriendRequest = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { remoteId } = req.body;
    console.log(req.body);
    const _id = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
    const user = yield user_model_1.default.findById(_id);
    if (!user) {
        throw new AppError_1.default('unauthorized', http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    if (user.friends.includes(new mongoose_1.default.Types.ObjectId(remoteId))) {
        throw new AppError_1.default("You are already friends now", http_statuscodes_1.default.BAD_REQUEST);
    }
    const callHistory = yield callInfo_model_1.default.findOne({ userId: new mongoose_1.default.Types.ObjectId(_id) });
    if (!callHistory) {
        throw new AppError_1.default("Not authorized user", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    const remoteUser = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(remoteId));
    if (!remoteUser) {
        throw new AppError_1.default("No user in this id", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    callHistory.callInfo.forEach((info) => {
        if (info.remoteUserId.toString() == remoteId) {
            info.requestSent = true;
        }
    });
    if (user.requestSent.includes(new mongoose_1.default.Types.ObjectId(remoteId))) {
        throw new AppError_1.default("Already you have sent request", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    ;
    user.requestSent.push(new mongoose_1.default.Types.ObjectId(remoteId));
    remoteUser.requests.push(user._id);
    yield remoteUser.save({ validateBeforeSave: false });
    yield callHistory.save({ validateBeforeSave: false });
    yield user.save({ validateBeforeSave: false });
    let callhistory = callHistory.callInfo;
    // Sort the call history by date in descending order
    callhistory.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
    });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, callHistory, "request sent sucessfully"));
}));
exports.fetchFriendRequestsFromDb = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const _id = (_f = req.user) === null || _f === void 0 ? void 0 : _f._id;
    const user = yield user_model_1.default.findById(_id).populate('requests', 'firstname');
    if (!user) {
        throw new AppError_1.default("unauthorized user", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    const requests = user.requests.reverse();
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, requests, "sucessfully fetched friend requests"));
}));
exports.acceptFriendRequest = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const _id = (_g = req.user) === null || _g === void 0 ? void 0 : _g._id;
    const { remoteId } = req.body;
    const user = yield user_model_1.default.findById(_id);
    if (!user) {
        throw new AppError_1.default("unauthorized user", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    const remoteUser = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(remoteId));
    user.requests.forEach((reqstId, index) => {
        if (reqstId.toString() == remoteId.toString()) {
            user.friends.push(user.requests.splice(index, 1)[0]);
        }
    });
    if (remoteUser === null || remoteUser === void 0 ? void 0 : remoteUser.requestSent.includes(user._id))
        remoteUser.friends.push(user._id);
    yield (remoteUser === null || remoteUser === void 0 ? void 0 : remoteUser.save({ validateBeforeSave: false }));
    yield user.save({ validateBeforeSave: false });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "friend request accepted succesfully"));
}));
exports.rejectFriendRequest = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const _id = (_h = req.user) === null || _h === void 0 ? void 0 : _h._id;
    const { id: remoteId } = req.query;
    const rejected = yield user_model_1.default.findByIdAndUpdate(_id, {
        $pull: { requests: remoteId }
    }, { new: true });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "friend request reject succesfully"));
}));
exports.fetchFriendsList = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const _id = (_j = req.user) === null || _j === void 0 ? void 0 : _j._id;
    const user = yield user_model_1.default.findById(_id).populate('friends', 'firstname');
    if (!user) {
        throw new AppError_1.default("unauthorized user", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    const friendsList = user.friends;
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, friendsList, "friends list fetched succesfully"));
}));
exports.getChannelName = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    const _id = (_k = req.user) === null || _k === void 0 ? void 0 : _k._id;
    const channelName = yield user_model_1.default.findById(_id).select('channelName');
    console.log(channelName);
    if (!channelName) {
        throw new AppError_1.default("user doesnot exist", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, channelName || { channelName: 'channel123' }, "channel name fetched succesfully"));
}));
function getRandomUsersByAnyTarget(target, userObject) {
    return [...selfHost].filter((user) => (user.target === userObject.gender) || (user.target === userObject.target));
}
function getRandomUsersByTarget(target, userObject) {
    return [...selfHost].filter((user) => (user.target === userObject.gender && userObject.target === user.gender) || user.gender === userObject.target);
}
function getRandomUser(checkArray) {
    const randomIndex = Math.floor(Math.random() * checkArray.length);
    console.log(randomIndex, 'randi');
    return checkArray[randomIndex];
}
function secondsToTimeString(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    // Return the time string in the format "minutes:seconds"
    return `${formattedMinutes}:${formattedSeconds}`;
}
