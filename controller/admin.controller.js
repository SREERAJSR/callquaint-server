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
exports.refreshAdminAccessToken = exports.logoutAdmin = exports.fetchSalesReports = exports.getAllSubscriptonPlans = exports.createSubscriptionPlan = exports.unblockUser = exports.blockUser = exports.fetchAllUsers = exports.fetchDashBoardData = exports.loginAdmin = exports.getAllUsersData = void 0;
const asyncHandler = require("express-async-handler");
const user_model_1 = __importDefault(require("../models/user.model"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const common_constant_1 = require("../types/constants/common.constant");
const user_services_1 = require("../services/user.services");
const mongoose_1 = __importDefault(require("mongoose"));
const ApiReponse_1 = __importDefault(require("../utils/ApiReponse"));
const subscriptionorder_model_1 = __importDefault(require("../models/subscriptionorder.model"));
const callInfo_model_1 = __importDefault(require("../models/callInfo.model"));
const subscription_model_1 = require("../models/subscription.model");
const moment_1 = __importDefault(require("moment"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getAllUsersData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({}, 'firstname lastname email subscription avatar _id isBlocked');
        return users;
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(error.message, http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
});
exports.getAllUsersData = getAllUsersData;
exports.loginAdmin = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    const user = yield user_model_1.default.findOne({ email: email, role: common_constant_1.UserRolesEnum.ADMIN });
    if (!user) {
        throw new AppError_1.default("Admin doesnt exist with this email", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new AppError_1.default("Invalid credentials", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    if (user.role !== common_constant_1.UserRolesEnum.ADMIN) {
        throw new AppError_1.default("Entered information is not admins", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    const { accessToken, refreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(user._id);
    const loggedInAdmin = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(user._id)).select('email firstname role,');
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { admin: loggedInAdmin, accessToken: accessToken, refreshToken: refreshToken }, 'Admin loggin sucessfully'));
}));
exports.fetchDashBoardData = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const usersCount = yield user_model_1.default.aggregate([
        {
            $count: "totalUser"
        }
    ]);
    const totalUsers = usersCount.length > 0 ? usersCount[0].totalUser : 0;
    const sucessOrders = yield subscriptionorder_model_1.default.aggregate([
        {
            $match: { "paymentStatus": "success" }
        },
        {
            $count: "sucessOrdersCount"
        }
    ]);
    const sucessOrdersCount = sucessOrders.length > 0 ? sucessOrders[0].sucessOrdersCount : 0;
    const subscribedUsers = yield user_model_1.default.aggregate([
        {
            $match: { "subscription": true }
        },
        {
            $count: "totalSubscribersCount"
        }
    ]);
    const currentSubscribersCount = subscribedUsers.length > 0 ? subscribedUsers[0].totalSubscribersCount : 0;
    const randomCalls = yield callInfo_model_1.default.aggregate([
        {
            $count: "randomCallsCount"
        }
    ]);
    const randomCallsCount = randomCalls.length > 0 ? randomCalls[0].randomCallsCount : 0;
    const salesData = yield subscriptionorder_model_1.default.aggregate([
        {
            $match: { paymentStatus: 'success' }
        },
        {
            $group: {
                _id: { $month: "$createdAt".toString() },
                totalSales: { $sum: "$amount" }
            }
        },
        {
            $sort: { _id: 1 } // Ensure the data is sorted by month
        }
    ]);
    const salesByMonth = Array(12).fill(0);
    salesData.forEach((item) => {
        salesByMonth[item._id - 1] = item.totalSales;
    });
    const premiumUsers = currentSubscribersCount;
    const normalUsers = Math.abs(totalUsers - currentSubscribersCount);
    const last5subscribedUsers = yield user_model_1.default.aggregate([
        { $match: { 'subscription': true } },
        { $sort: { updatedAt: -1 } },
        { $limit: 5 },
        {
            $project: {
                email: 1,
                firstname: 1,
                avatar: 1,
                _id: 1,
                subscriptionId: 1,
                subscriptionEndDate: 1
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "_id",
                localField: "subscriptionId",
                as: 'subscriptionDetails',
            }
        }, {
            $addFields: {
                subscriptionDetails: { $first: "$subscriptionDetails" }
            }
        }
    ]);
    const payload = {
        totalUsers: totalUsers,
        successOrdersCount: sucessOrdersCount,
        currentSubscribersCount: currentSubscribersCount,
        randomCallsCount: randomCallsCount,
        salesByMonth: salesByMonth,
        normalUsers: normalUsers,
        last5subscribedUsers: last5subscribedUsers
    };
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, payload, "sucess"));
}));
exports.fetchAllUsers = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const usersData = yield (0, exports.getAllUsersData)();
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, usersData, "fetched users data sucessfully"));
}));
exports.blockUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(userId));
    if (!user) {
        throw new AppError_1.default("User with this userId doesnot exist", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    if (user.isBlocked === true) {
        throw new AppError_1.default("This user is already blocked", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    const blockedUser = yield user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(userId), { isBlocked: true
    }, { new: true }).select('firstname lastname email isBlocked role  gender avatar');
    if (!exports.blockUser) {
        throw new AppError_1.default("Error in blocking the user", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, exports.blockUser, 'sucessfully blocked the user'));
}));
exports.unblockUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(userId));
    if (!user) {
        throw new AppError_1.default("User with this userId doesnot exist", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    if (user.isBlocked === false) {
        throw new AppError_1.default("This user is already unblocked", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    const unblockedUser = yield user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(userId), {
        isBlocked: false
    }, {
        new: true
    });
    if (!exports.unblockUser) {
        throw new AppError_1.default("Error in unblocking the user", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, exports.unblockUser, "Unblocked user sucesfully"));
}));
exports.createSubscriptionPlan = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriptionPlanDetails = req.body;
    if (!subscriptionPlanDetails) {
        throw new AppError_1.default("Request body is empty", http_statuscodes_1.default.BAD_REQUEST);
    }
    const existingPlanNameDetails = yield subscription_model_1.Subscription.findOne({
        planname: subscriptionPlanDetails.planname,
    });
    if (existingPlanNameDetails)
        throw new AppError_1.default("This planname is already exist ", http_statuscodes_1.default.BAD_REQUEST);
    // Check if plantype already exists
    const existingPlanTypeDetails = yield subscription_model_1.Subscription.findOne({
        plantype: subscriptionPlanDetails.plantype,
        plandurationunit: subscriptionPlanDetails.plandurationunit
    });
    if (existingPlanTypeDetails) {
        throw new AppError_1.default("A plan with the same type and duration unit already exists", http_statuscodes_1.default.BAD_REQUEST);
    }
    // Check if features are valid strings
    const invalidFeatures = subscriptionPlanDetails.features.filter(feature => typeof feature !== 'string');
    if (invalidFeatures.length > 0) {
        throw new AppError_1.default("Invalid feature(s) found", http_statuscodes_1.default.BAD_REQUEST);
    }
    const newSubscriptionPlan = yield subscription_model_1.Subscription.create(subscriptionPlanDetails);
    res.status(http_statuscodes_1.default.CREATED).json(new ApiReponse_1.default(http_statuscodes_1.default.CREATED, newSubscriptionPlan, 'plan is created'));
}));
exports.getAllSubscriptonPlans = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const subscriptionPlans = yield subscription_model_1.Subscription.find();
    if (!subscriptionPlans) {
        throw new AppError_1.default("Subscription plans doesnot exist ", http_statuscodes_1.default.NOT_FOUND);
        return;
    }
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, subscriptionPlans, "fetched subscriptions plans sucessfully"));
}));
exports.fetchSalesReports = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.query;
    if (!date) {
        throw new AppError_1.default("Date is required", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    const selectedDate = (0, moment_1.default)(date);
    let startDate;
    let endDate;
    if (!selectedDate.isValid()) {
        throw new AppError_1.default("invalid date format", http_statuscodes_1.default.BAD_REQUEST);
        return;
    }
    if (selectedDate.isSame(selectedDate.clone().startOf('year'), 'day')) {
        startDate = selectedDate.clone().startOf('year').toDate();
        endDate = selectedDate.clone().endOf('year').toDate();
    }
    else if (selectedDate.isSame(selectedDate.clone().startOf('month'), 'day')) {
        startDate = selectedDate.clone().startOf('month').toDate();
        endDate = selectedDate.clone().endOf('month').toDate();
    }
    else {
        startDate = selectedDate.clone().startOf('day').toDate();
        endDate = selectedDate.clone().endOf('day').toDate();
    }
    const salesReport = yield subscriptionorder_model_1.default.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }, {
            $group: {
                _id: null,
                totalSales: { $sum: "$amount" },
                count: { $sum: 1 },
                details: { $push: "$$ROOT" }
            }
        }
    ]);
    console.log(salesReport);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, salesReport, 'Succesfully fetched the sales report'));
}));
exports.logoutAdmin = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const adminId = req.admin._id;
    const user = yield user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(new mongoose_1.default.Types.ObjectId(adminId)), {
        $set: {
            refreshAccessToken: undefined
        }
    }, { new: true });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "admin logout succesfully"));
}));
exports.refreshAdminAccessToken = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.cookies);
    console.log(req.body);
    const incomingRefreshToken = req.body.incomingRefreshToken || req.cookies.refreshToken;
    if (!incomingRefreshToken)
        throw new AppError_1.default("Unauthorized request", http_statuscodes_1.default.UNAUTHORIZED);
    try {
        const decodedToken = yield jsonwebtoken_1.default.verify(incomingRefreshToken, (0, configkeys_1.default)().REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id));
        if (!user)
            throw new AppError_1.default('Invalid refresh token', http_statuscodes_1.default.UNAUTHORIZED);
        if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken))
            throw new AppError_1.default("Refresh token is expired or used", http_statuscodes_1.default.UNAUTHORIZED);
        const { accessToken, refreshToken: newRefreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(user._id);
        const options = {
            httpOnly: true,
            secure: (0, configkeys_1.default)().NODE_ENV === "production",
        };
        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    }
    catch (error) {
        throw new AppError_1.default("Invalid refresh token", http_statuscodes_1.default.UNAUTHORIZED);
    }
}));
