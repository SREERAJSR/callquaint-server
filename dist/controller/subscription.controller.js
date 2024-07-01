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
exports.saveGpayTranscation = exports.saveFailedInfoToDb = exports.savePaymentInfoToDb = exports.createOrder = exports.getCurrentSubscriptionPlan = exports.getSubscriptionPlans = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const subscription_model_1 = require("../models/subscription.model");
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const ApiReponse_1 = __importDefault(require("../utils/ApiReponse"));
const razorpay_1 = __importDefault(require("razorpay"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const crypto_1 = __importDefault(require("crypto"));
const subscriptionorder_model_1 = __importDefault(require("../models/subscriptionorder.model"));
const usermodel_interface_1 = require("../types/model/usermodel.interface");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const date_fns_1 = require("date-fns");
let razorPayInstance = new razorpay_1.default({
    key_id: (0, configkeys_1.default)().RAZOR_PAY_KEY_ID,
    key_secret: (0, configkeys_1.default)().RAZOR_PAY_SECRET_KEY
});
exports.getSubscriptionPlans = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const subscriptPlans = yield subscription_model_1.Subscription.find();
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(_id)).select('subscription');
    if (!user) {
        // throw new ApiResponse('')
    }
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { subscriptionPlans: subscriptPlans, user: user === null || user === void 0 ? void 0 : user.subscription }, "Subscription plans fetched sucessfully"));
}));
exports.getCurrentSubscriptionPlan = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const subscriptionDetails = yield user_model_1.default.aggregate([
        {
            $match: { _id: new mongoose_1.default.Types.ObjectId(userId) }
        },
        {
            $project: {
                firstname: 1,
                email: 1,
                subscription: 1,
                subscriptionEndDate: 1,
                subscriptionId: 1,
                avatar: 1
            }
        }, {
            $lookup: {
                from: 'subscriptions',
                foreignField: '_id',
                localField: 'subscriptionId',
                as: 'subscriptionDetails'
            }
        }, {
            $addFields: {
                subscriptionDetails: { $first: "$subscriptionDetails" }
            }
        }
    ]);
    const currentSubscriptonDetails = subscriptionDetails[0];
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, currentSubscriptonDetails, "Current subscriptionPlan fetched sucessfully"));
}));
exports.createOrder = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { amount, fullname, mobile, paymentmethod, planId, email } = req.body;
    console.log(req.body);
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: generateUniqueRecieptId()
    };
    const _id = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    const existSubscriber = yield user_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(_id),
        subscription: true
    });
    if (existSubscriber) {
        throw new AppError_1.default("You are already subscribed a plan ", http_statuscodes_1.default.BAD_REQUEST);
    }
    const order = yield razorPayInstance.orders.create(options);
    const orderId = order.id;
    const ordersInfo = {
        amount: amount,
        orderId: orderId,
        paymentStatus: usermodel_interface_1.OrderState.PENDING,
        receipt: order.receipt,
        userId: new mongoose_1.default.Types.ObjectId(_id),
        fullname: fullname,
        mobile: mobile.toString(),
        paymentmethod: paymentmethod,
        planId: new mongoose_1.default.Types.ObjectId(planId),
        email: email
    };
    const newOrder = yield subscriptionorder_model_1.default.create(ordersInfo);
    if (!newOrder) {
        throw new AppError_1.default("Order created failed", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
    res.status(http_statuscodes_1.default.CREATED).json(new ApiReponse_1.default(http_statuscodes_1.default.CREATED, { newOrder: newOrder, keyId: (0, configkeys_1.default)().RAZOR_PAY_KEY_ID }, "Order created successfully"));
}));
exports.savePaymentInfoToDb = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, status_code } = req.body;
    const _id = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const order = yield subscriptionorder_model_1.default.findOne({
        userId: new mongoose_1.default.Types.ObjectId(_id),
        orderId: razorpay_order_id.toString(),
    });
    if (!order) {
        throw new AppError_1.default('Order does not exist with this orderId', http_statuscodes_1.default.NOT_FOUND);
    }
    const orderedUserId = order.userId;
    const orderedPlanId = order.planId;
    order.paymentStatus = usermodel_interface_1.OrderState.SUCCESS;
    order.paymentId = razorpay_payment_id;
    yield order.save();
    const subscriptionPlan = yield subscription_model_1.Subscription.findById(orderedPlanId);
    if (!subscriptionPlan) {
        throw new AppError_1.default('Subscription plan does not exist with this planId', http_statuscodes_1.default.NOT_FOUND);
    }
    const { planduration, plandurationunit } = subscriptionPlan;
    const startDate = new Date();
    let endDate;
    switch (plandurationunit) {
        case 'days':
            endDate = (0, date_fns_1.addDays)(startDate, planduration);
            break;
        case 'weeks':
            endDate = (0, date_fns_1.addWeeks)(startDate, planduration);
            break;
        case 'months':
            endDate = (0, date_fns_1.addMonths)(startDate, planduration);
            break;
        case 'years':
            endDate = (0, date_fns_1.addYears)(startDate, planduration);
            break;
        default:
            throw new AppError_1.default('Invalid plan duration unit', http_statuscodes_1.default.BAD_REQUEST);
    }
    const existSubscriber = yield user_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(_id),
        subscription: true
    });
    if (existSubscriber) {
        throw new AppError_1.default("You are already subscribed a plan ", http_statuscodes_1.default.BAD_REQUEST);
    }
    yield user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(orderedUserId), {
        subscription: true,
        subscriptionEndDate: endDate,
        subscriptionId: order.planId
    });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, 'Payment info saved and subscription updated successfully'));
}));
exports.saveFailedInfoToDb = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { orderId } = req.body;
    const _id = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
    if (!orderId) {
        throw new AppError_1.default("without orderId can't proceed", http_statuscodes_1.default.BAD_REQUEST);
    }
    const order = yield subscriptionorder_model_1.default.findOne({
        userId: _id,
        orderId: orderId
    });
    if (!order) {
        throw new AppError_1.default("not any orders with this orderid", http_statuscodes_1.default.NOT_FOUND);
    }
    if (order === null || order === void 0 ? void 0 : order.paymentStatus) {
        order.paymentStatus = usermodel_interface_1.OrderState.FAILED;
    }
    order === null || order === void 0 ? void 0 : order.save();
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, order, 'Order failed sucesfully saved'));
}));
exports.saveGpayTranscation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const { amount, email, fullname, mobile, paymentmethod, planId } = req.body;
    if (paymentmethod !== 'gpay') {
        throw new AppError_1.default("wrong route handlers ", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f._id;
    const generatedOrderId = generateUniqueOrderIdForGpay();
    const existSubscriber = yield user_model_1.default.findOne({
        _id: new mongoose_1.default.Types.ObjectId(userId),
        subscription: true
    });
    if (existSubscriber) {
        throw new AppError_1.default("You are already subscribed a plan ", http_statuscodes_1.default.BAD_REQUEST);
    }
    const successOrder = new subscriptionorder_model_1.default({
        amount: amount,
        email: email,
        planId: planId,
        fullname: fullname,
        mobile: mobile,
        orderId: generatedOrderId,
        userId: userId,
        paymentmethod: paymentmethod,
        paymentStatus: usermodel_interface_1.OrderState.SUCCESS
    });
    const subscriptionPlan = yield subscription_model_1.Subscription.findById(planId);
    if (!subscriptionPlan) {
        throw new AppError_1.default('Subscription plan does not exist with this planId', http_statuscodes_1.default.NOT_FOUND);
    }
    const { planduration, plandurationunit } = subscriptionPlan;
    const startDate = new Date();
    let endDate;
    switch (plandurationunit) {
        case 'days':
            endDate = (0, date_fns_1.addDays)(startDate, planduration);
            break;
        case 'weeks':
            endDate = (0, date_fns_1.addWeeks)(startDate, planduration);
            break;
        case 'months':
            endDate = (0, date_fns_1.addMonths)(startDate, planduration);
            break;
        case 'years':
            endDate = (0, date_fns_1.addYears)(startDate, planduration);
            break;
        default:
            throw new AppError_1.default('Invalid plan duration unit', http_statuscodes_1.default.BAD_REQUEST);
    }
    yield successOrder.save({ validateBeforeSave: false });
    yield user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(userId), {
        subscription: true,
        subscriptionEndDate: endDate,
        subscriptionId: planId
    });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, successOrder, "Saved payment info in db"));
}));
const generateUniqueRecieptId = () => {
    return crypto_1.default.randomUUID();
};
const generateUniqueOrderIdForGpay = () => {
    return 'Order' + crypto_1.default.randomUUID();
};
