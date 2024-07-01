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
exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionPlanSchema = new mongoose_1.Schema({
    planname: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    plantype: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    features: {
        type: [
            {
                type: String
            }
        ], default: []
    },
    planduration: {
        type: Number,
        required: true,
        min: 1
    },
    plandurationunit: {
        type: String,
        required: true,
        enum: ['days', 'weeks', 'months', 'years']
    }
});
exports.Subscription = mongoose_1.default.model('subscription', subscriptionPlanSchema);
// subscriptionPlanSchema.virtual('plandurationEndDate').get(function () {
//     const now = new Date()
//     switch (this.plandurationUnit) {
//         case 'days':
//             return new Date(now.setDate(now.getDate() + this.planduration))
//         case 'weeks':
//             return new Date(now.setDate(now.getDate() + this.planduration * 7))
//         case 'months':
//             return new Date(now.setMonth(now.getMonth() + this.planduration))
//         case 'years':
//             return new Date(now.setFullYear(now.getFullYear() + this.planduration))
//         default:
//             return null
//     }
// })
