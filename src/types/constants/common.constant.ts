import { object } from "joi";

export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};


export const availableUserRoles = Object.values(UserRolesEnum)


export const SocialLoginEnums = {
    GOOGLE: "GOOGLE",
    EMAIL_PASSWORD: "EMAIL_PASSWORD",
}


export const AvailableSocialLogins = Object.values(SocialLoginEnums)

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000;

export const genderEnums ={
  MALE: 'male',
  FEMALE:'female'
}

export const genders = Object.values(genderEnums);

export enum ConnectTargetEnums {
  ANY = 'any',
  MALE = 'male',
  FEMALE = 'female'
}