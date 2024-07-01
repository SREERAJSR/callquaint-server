"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const usermodel_interface_1 = require("../types/model/usermodel.interface");
const razorpay_interfaces_1 = require("../types/interfaces/razorpay.interfaces");
const subscriptionOrderSchema = new mongoose_1.Schema({
    email: {
        type: String,
    },
    fullname: {
        type: String,
    },
    mobile: {
        type: String
    },
    planId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'subscription'
    },
    paymentmethod: {
        type: String,
        enum: razorpay_interfaces_1.paymentMethodsObjectEnums
    },
    userId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'user',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: usermodel_interface_1.orderStateEnum,
        required: true
    },
    receipt: {
        type: String,
    },
    orderId: {
        type: String,
    },
    paymentId: {
        type: String
    }
}, {
    timestamps: true
});
const Order = mongoose_1.default.model('subscriptionorder', subscriptionOrderSchema);
exports.default = Order;
