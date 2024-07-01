import mongoose, { Schema } from "mongoose";
import { IsubscriptionOrderModel, orderStateEnum } from "../types/model/usermodel.interface";
import { paymentMethodsObjectEnums } from "../types/interfaces/razorpay.interfaces";

const subscriptionOrderSchema = new Schema({
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
        type: mongoose.Types.ObjectId,
        ref:'subscription'
    },
    paymentmethod: {
        type: String,
        enum:paymentMethodsObjectEnums
},
    userId: {
        type: mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    amount: {
        type: Number,
        required:true
    },
    paymentStatus: {
        type: String,
        enum: orderStateEnum,
        required:true
    },
    receipt: {
        type: String,
    },
    orderId: {
        type: String,
    },
    paymentId: {
        type:String
    }
},{
        timestamps:true
    })

const Order = mongoose.model<IsubscriptionOrderModel>('subscriptionorder', subscriptionOrderSchema)

export default Order;