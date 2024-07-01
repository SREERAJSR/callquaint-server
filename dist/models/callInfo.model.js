"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callInfoSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.callInfoSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    callInfo: [{
            remoteUserId: {
                type: mongoose_1.default.Types.ObjectId,
                ref: 'user',
            },
            callDuration: {
                type: String,
                required: true
            },
            date: {
                type: Date,
            },
            requestSent: {
                type: Boolean,
                default: false
            },
            friend: {
                type: Boolean
            }
        }]
});
const CallInfo = mongoose_1.default.model('callInformation', exports.callInfoSchema);
exports.default = CallInfo;
