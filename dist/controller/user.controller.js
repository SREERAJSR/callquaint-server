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
exports.assignRole = exports.editProfileInfo = exports.getUserInfo = exports.logoutUser = exports.setGenderForGoogleAuthUsers = exports.handleSocialLogin = exports.resetPasswordRequest = exports.forgotPasswordRequest = exports.refreshAccessToken = exports.loginUser = exports.verifyEmail = exports.signupUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const user_model_1 = __importDefault(require("../models/user.model"));
const crypto = __importStar(require("crypto"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const create_email_1 = __importDefault(require("../utils/create-email"));
const common_constant_1 = require("../types/constants/common.constant");
const ApiReponse_1 = __importDefault(require("../utils/ApiReponse"));
const user_services_1 = require("../services/user.services");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const message_controller_1 = require("./message.controller");
const mongoose_1 = __importDefault(require("mongoose"));
const chat_services_1 = require("../services/chat.services");
exports.signupUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, gender, password } = req.body;
    const existedUser = yield user_model_1.default.findOne({ email: email });
    if (existedUser)
        throw new AppError_1.default('This email is already associated with an account', http_statuscodes_1.default.BAD_REQUEST);
    const user = yield new user_model_1.default({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        isEmailVerified: false,
        role: common_constant_1.UserRolesEnum.USER,
        gender: gender
    });
    const { unHashedToken, hashedToken, tokenExpiry } = yield user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    yield user.save({ validateBeforeSave: false });
    const url = `${(0, configkeys_1.default)().ORIGIN}/login/${unHashedToken}`;
    yield (0, create_email_1.default)(email, 'verify email', url);
    const createdUser = yield user_model_1.default.findById(user._id).select("-avatar -password -refreshToken -emailVerficationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry ");
    if (!createdUser)
        throw new AppError_1.default("Something went wrong while registering the user", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    res.status(http_statuscodes_1.default.ACCEPTED).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { user: createdUser }, "Users registered successfully and verification email has been sent on your email."));
}));
exports.verifyEmail = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { verificationToken } = req.params;
    if (!verificationToken)
        throw new AppError_1.default("Email verification token is missing", http_statuscodes_1.default.BAD_REQUEST);
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest("hex");
    const user = yield user_model_1.default.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });
    if (!user)
        throw new AppError_1.default("Token is invalid or expired", http_statuscodes_1.default.UNAUTHORIZED);
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.isEmailVerified = true;
    yield user.save({ validateBeforeSave: false });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { isEmailVerified: true }));
}));
exports.loginUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_model_1.default.findOne({ email: email });
    if (!user)
        throw new AppError_1.default("User does not exist", http_statuscodes_1.default.NOT_FOUND);
    if (user.loginType !== common_constant_1.SocialLoginEnums.EMAIL_PASSWORD)
        throw new AppError_1.default(`You have previously registered using ${user.loginType.toLowerCase()} please use the ${user.loginType.toLowerCase()} login option for access your account`, http_statuscodes_1.default.BAD_REQUEST);
    const isPasswordValid = yield user.isPasswordCorrect(password);
    if (!isPasswordValid)
        throw new AppError_1.default("invalid credentials", http_statuscodes_1.default.UNAUTHORIZED);
    const { accessToken, refreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(user._id);
    const loggedInUser = yield user_model_1.default.findById(user._id).select(" -password -refreshToken -emailVerficationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry ");
    const options = {
        httpOnly: true,
        secure: (0, configkeys_1.default)().NODE_ENV === "production",
    };
    res.status(http_statuscodes_1.default.OK).
        cookie('accesToken', accessToken)
        .cookie('refreshToken', refreshToken).
        json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken }, "user logged in succesfully"));
}));
exports.refreshAccessToken = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.cookies);
    console.log(req.body);
    const incomingRefreshToken = req.body.incomingRefreshToken || req.cookies.refreshToken;
    if (!incomingRefreshToken)
        throw new AppError_1.default("Unauthorized request", http_statuscodes_1.default.UNAUTHORIZED);
    try {
        const decodedToken = yield jsonwebtoken_1.default.verify(incomingRefreshToken, (0, configkeys_1.default)().REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id);
        if (!user)
            throw new AppError_1.default('Invalid refresh token', http_statuscodes_1.default.UNAUTHORIZED);
        if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken))
            throw new AppError_1.default("Refresh token is expired or used", http_statuscodes_1.default.UNAUTHORIZED);
        const { accessToken } = yield (0, user_services_1.generateAccessToken)(user._id);
        const options = {
            httpOnly: true,
            secure: (0, configkeys_1.default)().NODE_ENV === "production",
        };
        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { accessToken }, "Access token refreshed"));
    }
    catch (error) {
        throw new AppError_1.default("Invalid refresh token", http_statuscodes_1.default.UNAUTHORIZED);
    }
}));
exports.forgotPasswordRequest = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield user_model_1.default.findOne({ email: email });
    if (!user)
        throw new AppError_1.default("user doesn't exist with this email", http_statuscodes_1.default.BAD_REQUEST);
    if (user.loginType === common_constant_1.SocialLoginEnums.GOOGLE) {
        throw new AppError_1.default("This email is registered with google login method", http_statuscodes_1.default.BAD_REQUEST);
    }
    const { unHashedToken, hashedToken, tokenExpiry } = yield user.generateTemporaryToken();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    yield user.save({ validateBeforeSave: false });
    const url = `${(0, configkeys_1.default)().ORIGIN}/reset-password/${unHashedToken}`;
    yield (0, create_email_1.default)(email, "Please verify your email to reset password", url);
    res.status(200).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "Password reset mail has been sent on your mail id"));
}));
exports.resetPasswordRequest = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirm_password } = req.body;
    const { resetToken } = req.params;
    if (password !== confirm_password)
        throw new AppError_1.default("Both passwords are not same", http_statuscodes_1.default.BAD_GATEWAY);
    const hashedToken = yield crypto.createHash('sha256').update(resetToken).digest('hex');
    if (!hashedToken)
        throw new AppError_1.default("token is wrong", http_statuscodes_1.default.BAD_REQUEST);
    const user = yield user_model_1.default.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    });
    if (!user)
        throw new AppError_1.default("token is invalid or expired", http_statuscodes_1.default.BAD_EVENT);
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    user.password = password;
    yield user.save({ validateBeforeSave: false });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "reset password sucessfully"));
}));
exports.handleSocialLogin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { firstName, lastName, email, provider: loginType, photoUrl } = req.body;
    const user = yield user_model_1.default.findOne({ email: email });
    if (user) {
        if (user.loginType !== loginType) {
            throw new AppError_1.default(`you have previously registered using ${user === null || user === void 0 ? void 0 : user.loginType.toLowerCase()}.  Please use the ${(_a = user === null || user === void 0 ? void 0 : user.loginType) === null || _a === void 0 ? void 0 : _a.toLowerCase()}login option to access your account.`, http_statuscodes_1.default.BAD_REQUEST);
        }
        const _id = user === null || user === void 0 ? void 0 : user._id;
        const { accessToken, refreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(_id);
        const existedUser = yield user_model_1.default.findById(_id).select("-password -refreshToken -emailVerficationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry ");
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { accessToken: accessToken, refreshToken: refreshToken, user: existedUser }, "Google authentication successfull!"));
    }
    else {
        const createdUser = yield new user_model_1.default({
            firstname: firstName,
            lastname: lastName,
            email: email,
            isEmailVerified: true,
            role: common_constant_1.UserRolesEnum.USER,
            loginType: loginType,
            avatar: photoUrl,
            gender: null
        });
        yield createdUser.save({ validateBeforeSave: false });
        const createdUserId = createdUser === null || createdUser === void 0 ? void 0 : createdUser._id;
        const { accessToken, refreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(createdUserId);
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        };
        const newUser = yield user_model_1.default.findById(createdUserId).select(" -password -refreshToken -emailVerficationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry ");
        if (!newUser)
            throw new AppError_1.default("Something went wrong while registering the user", http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
        res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { accessToken: accessToken, refreshToken: refreshToken, user: newUser }, "Google authentication successfull! "));
    }
}));
exports.setGenderForGoogleAuthUsers = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { gender } = req.body;
    const user_id = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const user = yield user_model_1.default.findById(user_id);
    if (!user)
        throw new AppError_1.default("user is not available", http_statuscodes_1.default.UNAUTHORIZED);
    user.gender = gender;
    user.save({ validateBeforeSave: false });
    const updatedUser = yield user_model_1.default.findById(user._id).select("-password -refreshToken -emailVerficationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry ");
    const { accessToken, refreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(user_id);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { user: updatedUser, accessToken: accessToken, refreshToken: refreshToken }, 'sucessfully gender information updated'));
}));
exports.logoutUser = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const _id = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    const user = yield user_model_1.default.findByIdAndUpdate(_id, {
        $set: {
            refreshAccessToken: undefined
        }
    }, {
        new: true
    });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "User logout sucessfully"));
}));
exports.getUserInfo = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const _id = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const user = yield user_model_1.default.findById(_id).select(" -refreshToken -emailVerficationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry ");
    if (!user) {
        throw new AppError_1.default("User is not authorized", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, user, "user data fetched sucessfully"));
}));
exports.editProfileInfo = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const { firstname, lastname, email, gender } = req.body;
    const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(userId));
    if (!user)
        throw new AppError_1.default("User is not authorized", http_statuscodes_1.default.UNAUTHORIZED);
    const updatFields = {
        firstname,
        lastname,
        email,
        gender
    };
    if (req.file) {
        const filename = req.file.filename;
        const avatarUrl = (0, message_controller_1.getStaticPath)(req, filename);
        updatFields.avatar = avatarUrl;
    }
    const updateProfileUser = yield user_model_1.default.findByIdAndUpdate(new mongoose_1.default.Types.ObjectId(userId), {
        $set: updatFields,
    }, { new: true, runValidators: true });
    if (!updateProfileUser) {
        throw new AppError_1.default("User not found", http_statuscodes_1.default.NOT_FOUND);
    }
    const { accessToken, refreshToken } = yield (0, user_services_1.generateAcessTokenAndrefreshToken)(updateProfileUser._id);
    yield user.save({ validateBeforeSave: false });
    const newUrl = user.avatar.toString().replace("http://localhost:3000/", "public/");
    if (newUrl !== 'public/images/accountdp.jpg')
        (0, chat_services_1.removeLocalFile)(newUrl);
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, { accessToken: accessToken, refreshToken: refreshToken }, 'profile edited sucesfully'));
}));
exports.assignRole = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { role } = req.body;
    const user = yield user_model_1.default.findById(new mongoose_1.default.Types.ObjectId(userId));
    if (!user) {
        throw new AppError_1.default("not authorized", http_statuscodes_1.default.UNAUTHORIZED);
        return;
    }
    user.role = role;
    yield user.save({ validateBeforeSave: false });
    res.status(http_statuscodes_1.default.OK).json(new ApiReponse_1.default(http_statuscodes_1.default.OK, {}, "Role changed for the user"));
}));
