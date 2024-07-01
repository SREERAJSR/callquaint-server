import { NextFunction, Request, Response } from 'express';
import asynchHandler from 'express-async-handler';
import { Subscription } from '../models/subscription.model';
import HttpStatus from '../types/constants/http-statuscodes';
import AppError from '../utils/AppError';
import ApiResponse from '../utils/ApiReponse';
import {  IsubscriptionPlan, IsubscriptionPlanRequestBody } from '../types/model/subscriptionmodel.interface';
import Razorpay from 'razorpay';
import configKey from '../configs/configkeys';
import crypto from 'crypto';
import { GpayRequestBody, IRazorPayConfig, IRazorpaycreateOrderRequestBody, RazorpayOrderSuccessReqbody } from '../types/interfaces/razorpay.interfaces';
import Order from '../models/subscriptionorder.model';
import { IOrderInfo, IsubscriptionOrderModel, OrderState, orderStateEnum } from '../types/model/usermodel.interface';
import mongoose from 'mongoose';
import User from '../models/user.model';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
    let razorPayInstance = new Razorpay({
        key_id: configKey().RAZOR_PAY_KEY_ID,
        key_secret:configKey().RAZOR_PAY_SECRET_KEY
    })
export const getSubscriptionPlans = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {
    const _id = req.user?._id
  const subscriptPlans = await Subscription.find();
  const user = await User.findById(new mongoose.Types.ObjectId(_id)).select('subscription')
  if (!user) {
    // throw new ApiResponse('')
  }
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,{subscriptionPlans:subscriptPlans,user:user?.subscription},"Subscription plans fetched sucessfully"))
})


export const getCurrentSubscriptionPlan = asynchHandler(async (req: Request, res: Response, next: NextFunction)=>{
  
  const userId = req.user?._id;
  const subscriptionDetails = await User.aggregate([
    {
      $match:{_id:new mongoose.Types.ObjectId(userId)}
    },
    {
      $project: {
        firstname: 1,
        email: 1,
        subscription: 1,
        subscriptionEndDate: 1,
        subscriptionId: 1,
        avatar:1
      }
    }, {
      $lookup: {
        from: 'subscriptions',
        foreignField: '_id',
        localField: 'subscriptionId',
        as:'subscriptionDetails'
      }
    }, {
      $addFields: {
        subscriptionDetails: { $first: "$subscriptionDetails" }  
      }
    }
  ])

  const currentSubscriptonDetails = subscriptionDetails[0]

  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,currentSubscriptonDetails,"Current subscriptionPlan fetched sucessfully"))
})

export const createOrder = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { amount, fullname, mobile, paymentmethod, planId,email } = req.body as IRazorpaycreateOrderRequestBody
    console.log(req.body);
    const options:IRazorPayConfig = {
        amount: amount*100,
        currency: "INR",
        receipt:generateUniqueRecieptId()
    }
    const _id = req.user?._id;
     const existSubscriber = await User.findOne({
        _id:new mongoose.Types.ObjectId(_id),
        subscription :true
    })
    if (existSubscriber) {
        throw new AppError("You are already subscribed a plan ",HttpStatus.BAD_REQUEST)
    }
    const order = await razorPayInstance.orders.create(options)
    const orderId = order.id
    const ordersInfo: IOrderInfo = {
        amount: amount,
        orderId: orderId,
        paymentStatus: OrderState.PENDING,
        receipt: order.receipt!,
        userId: new mongoose.Types.ObjectId(_id),
        fullname: fullname,
        mobile: mobile.toString(),
        paymentmethod: paymentmethod,
        planId: new mongoose.Types.ObjectId(planId),
        email:email
    }
    const newOrder = await Order.create(ordersInfo)
    if (!newOrder) {
        throw new AppError("Order created failed",HttpStatus.INTERNAL_SERVER_ERROR)
    }
    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED,{newOrder:newOrder,keyId:configKey().RAZOR_PAY_KEY_ID},"Order created successfully"))
})


export const savePaymentInfoToDb = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, status_code } = req.body as RazorpayOrderSuccessReqbody;
    const _id = req.user?._id;

    const order = await Order.findOne({
      userId: new mongoose.Types.ObjectId(_id),
      orderId: razorpay_order_id.toString(),
    });

    if (!order) {
      throw new AppError('Order does not exist with this orderId', HttpStatus.NOT_FOUND);
    }
    const orderedUserId = order.userId;
    const orderedPlanId = order.planId;
    order.paymentStatus = OrderState.SUCCESS; 
  order.paymentId = razorpay_payment_id;
    await order.save();

    const subscriptionPlan = await Subscription.findById(orderedPlanId);

    if (!subscriptionPlan) {
      throw new AppError('Subscription plan does not exist with this planId', HttpStatus.NOT_FOUND);
    }

    const { planduration, plandurationunit } = subscriptionPlan;
    const startDate = new Date();
    let endDate: Date;

    switch (plandurationunit) {
      case 'days':
        endDate = addDays(startDate, planduration);
        break;
      case 'weeks':
        endDate = addWeeks(startDate, planduration);
        break;
      case 'months':
        endDate = addMonths(startDate, planduration);
        break;
      case 'years':
        endDate = addYears(startDate, planduration);
        break;
      default:
        throw new AppError('Invalid plan duration unit', HttpStatus.BAD_REQUEST);
    }
    const existSubscriber = await User.findOne({
        _id:new mongoose.Types.ObjectId(_id),
        subscription :true
    })
    if (existSubscriber) {
        throw new AppError("You are already subscribed a plan ",HttpStatus.BAD_REQUEST)
    }
    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(orderedUserId), {
      subscription: true,
      subscriptionEndDate: endDate,
      subscriptionId:order.planId
    });

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,{},'Payment info saved and subscription updated successfully'));


});


export const saveFailedInfoToDb = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body as { orderId: string }
    const _id = req.user?._id;
    if (!orderId) {
        throw new AppError("without orderId can't proceed",HttpStatus.BAD_REQUEST)
    }
    const order = await Order.findOne({
        userId: _id,
        orderId:orderId
    })
    if (!order) {
        throw new AppError("not any orders with this orderid",HttpStatus.NOT_FOUND)
    }
    if (order?.paymentStatus) {
        order.paymentStatus = OrderState.FAILED;
    }
    order?.save();

res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,order,'Order failed sucesfully saved'))

})

export const saveGpayTranscation = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { amount, email, fullname, mobile, paymentmethod, planId } = req.body as GpayRequestBody
    if (paymentmethod !== 'gpay') {
        throw new AppError("wrong route handlers ", HttpStatus.BAD_REQUEST);
        return
    }
      const userId = req.user?._id;
    const generatedOrderId = generateUniqueOrderIdForGpay();
     const existSubscriber = await User.findOne({
        _id:new mongoose.Types.ObjectId(userId),
        subscription :true
    })
    if (existSubscriber) {
        throw new AppError("You are already subscribed a plan ",HttpStatus.BAD_REQUEST)
    }
    const successOrder = new Order({
        amount: amount,
        email: email,
        planId: planId,
        fullname: fullname,
        mobile: mobile,
        orderId: generatedOrderId,
        userId: userId,
        paymentmethod: paymentmethod,
        paymentStatus:OrderState.SUCCESS
    })
 

    const subscriptionPlan = await Subscription.findById(planId);

    if (!subscriptionPlan) {
      throw new AppError('Subscription plan does not exist with this planId', HttpStatus.NOT_FOUND);
    }

    const { planduration, plandurationunit } = subscriptionPlan;
    const startDate = new Date();
    let endDate: Date;

    switch (plandurationunit) {
      case 'days':
        endDate = addDays(startDate, planduration);
        break;
      case 'weeks':
        endDate = addWeeks(startDate, planduration);
        break;
      case 'months':
        endDate = addMonths(startDate, planduration);
        break;
      case 'years':
        endDate = addYears(startDate, planduration);
        break;
      default:
        throw new AppError('Invalid plan duration unit', HttpStatus.BAD_REQUEST);
    }
   
       await successOrder.save({ validateBeforeSave: false })
    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
      subscription: true,
      subscriptionEndDate: endDate,
      subscriptionId:planId
    });
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,successOrder,"Saved payment info in db"))
})
const generateUniqueRecieptId=() :string=>{
    return crypto.randomUUID()
}

const generateUniqueOrderIdForGpay = ():string => {
    return 'Order' + crypto.randomUUID();
}