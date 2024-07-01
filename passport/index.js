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
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_1 = __importDefault(require("passport"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const user_model_1 = __importDefault(require("../models/user.model"));
const common_constant_1 = require("../types/constants/common.constant");
const AppError_1 = __importDefault(require("../utils/AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
try {
    passport_1.default.serializeUser((req, user, next) => {
        next(null, user._id);
    });
    passport_1.default.deserializeUser((id, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield user_model_1.default.findById(id);
            if (user)
                next(null, user);
            else
                next(new AppError_1.default("User does not exist", http_statuscodes_1.default.NOT_FOUND), null);
        }
        catch (error) {
            next(new AppError_1.default("Something went wrong while deserializing the user. Error: " + error, http_statuscodes_1.default.INTERNAL_SERVER_ERROR), null);
        }
    }));
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: (0, configkeys_1.default)().GOOGLE_CLIENT_ID,
        clientSecret: (0, configkeys_1.default)().GOOGLE_CLIENT_SECRET,
        callbackURL: (0, configkeys_1.default)().GOOGLE_CALLBACK_URL
    }, (_, __, profile, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        console.log(profile);
        const user = yield user_model_1.default.findOne({ email: (_a = profile === null || profile === void 0 ? void 0 : profile._json) === null || _a === void 0 ? void 0 : _a.email });
        if (user) {
            if ((user === null || user === void 0 ? void 0 : user.loginType) !== common_constant_1.SocialLoginEnums.GOOGLE) {
                next(new AppError_1.default(`you have previously registered using 
                    ${user === null || user === void 0 ? void 0 : user.loginType.toLowerCase()}
                . Please use the ${(_b = user === null || user === void 0 ? void 0 : user.loginType) === null || _b === void 0 ? void 0 : _b.toLowerCase()}
                login option to access your account.`, http_statuscodes_1.default.BAD_REQUEST));
            }
            else
                next(null, user);
        }
        else {
            const createdUser = yield user_model_1.default.create({
                email: profile === null || profile === void 0 ? void 0 : profile._json.email,
                password: profile === null || profile === void 0 ? void 0 : profile._json.sub,
                firstname: profile === null || profile === void 0 ? void 0 : profile._json.given_name,
                lastname: profile === null || profile === void 0 ? void 0 : profile._json.family_name,
                isEmailVerified: true,
                role: common_constant_1.UserRolesEnum.USER,
                avatar: {
                    url: profile._json.picture,
                    localPath: ''
                },
                loginType: common_constant_1.SocialLoginEnums.GOOGLE
            });
            if (createdUser) {
                next(null, createdUser);
            }
            else {
                next(new AppError_1.default("Error while registering the user", http_statuscodes_1.default.INTERNAL_SERVER_ERROR));
            }
        }
    })));
    // passport.use(new GithubStrategy({
    //     clientID: configKey().GITHUB_CLIENT_ID,
    //     clientSecret: configKey().GITHUB_CLIENT_SECRET,
    //     callbackURL: configKey().GITHUB_CALLBACK_URL
    // }, async (_: string, __: string, profile: any, next: any) => {
    //     console.log(profile)
    //     const user = await User.findOne({ email: profile?._json.email });
    //     if (user) {
    //         if (user.loginType !== SocialLoginEnums.GITHUB) {
    //             next(new AppError("You have previously registered using " +
    //                 user.loginType?.toLowerCase()?.split("_").join(" ") +
    //                 ". Please use the " +
    //                 user.loginType?.toLowerCase()?.split("_").join(" ") +
    //                 " login option to access your account.", HttpStatus.BAD_REQUEST), null);
    //         } else {
    //             next(null, user);
    //         }
    //     } else {
    //         if (!profile._json.email) {
    //             // next(new AppError( "User does not have a public email associated with their account. Please try another login method",HttpStatus.BAD_REQUEST),null)
    //         } else {
    //             const createdUser = await User.create({
    //                 email: profile._json.email,
    //                 password: profile._json.node_id,
    //                 firstname: profile?.given_name,
    //                 lastname: profile?.family_name,
    //                 isEmailVerified: true,
    //                 role: UserRolesEnum.USER,
    //                 avatar: {
    //                     url: profile._json.picture,
    //                     localPath:""
    //                 },
    //                 loginType: SocialLoginEnums.GITHUB,
    //             })
    //             if (createdUser) {
    //                 next(null,createdUser)
    //             } else {
    //                 next(new AppError("Error while registering the user",HttpStatus.INTERNAL_SERVER_ERROR),null)
    //             }
    //         }
    //     }
    // }))
}
catch (error) {
    console.error("PASSPORT ERROR: ", error);
}
