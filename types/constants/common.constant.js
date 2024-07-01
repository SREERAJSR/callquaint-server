"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectTargetEnums = exports.genders = exports.genderEnums = exports.USER_TEMPORARY_TOKEN_EXPIRY = exports.AvailableSocialLogins = exports.SocialLoginEnums = exports.availableUserRoles = exports.UserRolesEnum = void 0;
exports.UserRolesEnum = {
    ADMIN: "ADMIN",
    USER: "USER",
};
exports.availableUserRoles = Object.values(exports.UserRolesEnum);
exports.SocialLoginEnums = {
    GOOGLE: "GOOGLE",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
};
exports.AvailableSocialLogins = Object.values(exports.SocialLoginEnums);
exports.USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000;
exports.genderEnums = {
    MALE: 'male',
    FEMALE: 'female'
};
exports.genders = Object.values(exports.genderEnums);
var ConnectTargetEnums;
(function (ConnectTargetEnums) {
    ConnectTargetEnums["ANY"] = "any";
    ConnectTargetEnums["MALE"] = "male";
    ConnectTargetEnums["FEMALE"] = "female";
})(ConnectTargetEnums || (exports.ConnectTargetEnums = ConnectTargetEnums = {}));
