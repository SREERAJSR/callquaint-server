import mongoose,{Document, mongo} from "mongoose";


export interface TemporaryToken{
    unHashedToken: string, hashedToken: string, tokenExpiry: Date
}
export interface UserDocument extends Document {
    avatar: {
        String?: string | null | undefined;
        localPath?: string | null | undefined; 
    };
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    gender: string;
    password: string;
    loginType: string;
    isEmailVerified: boolean;
    refreshToken?: string;
    forgotPasswordToken?: string;
    forgotPasswordExpiry?: Date;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
    expireAt?: Date;
    channelName: string;
    requests: mongoose.Types.ObjectId[];
    friends: mongoose.Types.ObjectId[];
    requestSent: mongoose.Types.ObjectId[];
    subscription: boolean,
    subscriptionEndDate: Date,
    subscriptionId: mongoose.Types.ObjectId,
    isBlocked: boolean
    // Define methods
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): Promise<string>;
    generateRefreshToken(): Promise<string>;
    generateTemporaryToken(): Promise<TemporaryToken>;
}


export interface GoogleAuthenticatedUserInterface {
  email:string,
firstName: string
id: string
idToken: string
lastName?:string
name?: string
photoUrl?:string
provider?:string
    
}



export enum OrderState{
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed'
}
export const orderStateEnum = Object.values(OrderState)

export interface IsubscriptionOrderModel extends Document{
    userId: mongoose.Types.ObjectId,
    amount: number,
    paymentStatus: 'pending' | 'success' | 'failed',
    receipt: string,
    orderId: string,
    paymentId?: string,
    fullname: string,
    mobile: string,
    planId: mongoose.Types.ObjectId,
    paymentmethod: 'razorpay' | 'gpay',
    email:string
}


export interface IOrderInfo{

    userId: mongoose.Types.ObjectId,
    amount: number,
    paymentStatus: 'pending' | 'success' | 'failed',
    receipt?: string,
    orderId: string,
    paymentId?: string,
    fullname: string,
    mobile: string,
    planId: mongoose.Types.ObjectId,
    paymentmethod: 'razorpay' | 'gpay',
    email:string
}