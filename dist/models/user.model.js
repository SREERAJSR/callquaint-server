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
const mongoose_1 = __importDefault(require("mongoose"));
const common_constant_1 = require("../types/constants/common.constant");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const userSchema = new mongoose_1.default.Schema({
    avatar: {
        type: String,
        default: 'http://localhost:3000/images/accountdp.jpg'
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
    },
    gender: {
        type: String || null,
        required: true,
        enum: common_constant_1.genders || null
    },
    email: {
        type: String,
        unique: true,
        lowerCase: true,
        trim: true,
        required: true,
    },
    role: {
        type: String,
        enum: common_constant_1.availableUserRoles,
        default: common_constant_1.UserRolesEnum.USER,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    requests: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'user'
        }
    ],
    requestSent: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'user'
        }
    ],
    friends: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: 'user'
        }
    ],
    channelName: {
        type: String,
        unique: true,
        required: true,
        default: () => generateChannelName()
    },
    loginType: {
        type: String,
        enum: common_constant_1.AvailableSocialLogins,
        default: common_constant_1.SocialLoginEnums.EMAIL_PASSWORD
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    },
    forgotPasswordToken: {
        type: String
    },
    forgotPasswordExpiry: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpiry: {
        type: Date
    },
    expireAt: {
        type: Date,
        default: Date.now,
        index: true // Index to facilitate querying
    },
    subscription: {
        type: Boolean,
        default: false
    },
    subscriptionEndDate: {
        type: Date
    },
    subscriptionId: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'subscriptions'
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified('password'))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        next();
    });
});
userSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(password, this.password);
    });
};
userSchema.methods.generateAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jsonwebtoken_1.default.sign({
            firstname: this.firstname,
            lastname: this.lastname,
            _id: this._id,
            email: this.email,
            avatar: this.avatar,
            gender: this.gender,
            role: this.role
        }, (0, configkeys_1.default)().ACCESS_TOKEN_SECRET, { expiresIn: (0, configkeys_1.default)().ACCESS_TOKEN_EXPIRY });
    });
};
userSchema.methods.generateRefreshToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jsonwebtoken_1.default.sign({
            _id: this._id
        }, (0, configkeys_1.default)().REFRESH_TOKEN_SECRET, { expiresIn: (0, configkeys_1.default)().REFRESH_TOKEN_EXPIRY });
    });
};
userSchema.methods.generateTemporaryToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const unHashedToken = node_crypto_1.default.randomBytes(20).toString("hex");
        const hashedToken = node_crypto_1.default.createHash('sha256').update(unHashedToken).digest('hex');
        const tokenExpiry = new Date(Date.now() + common_constant_1.USER_TEMPORARY_TOKEN_EXPIRY);
        return {
            unHashedToken,
            hashedToken,
            tokenExpiry
        };
    });
};
function generateChannelName() {
    return `channel${node_crypto_1.default.randomUUID()}`;
}
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
