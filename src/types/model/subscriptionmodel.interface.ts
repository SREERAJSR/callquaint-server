import mongoose, { Date, Document, mongo } from "mongoose"

export interface IsubscriptionPlan extends Document{
    planname:string,
    plantype: string,
    amount: number,
    features: string[] | [],
    planduration: number,
    plandurationunit: 'days' | 'weeks' | 'months' | 'years';
}


export interface IsubscriptionPlanRequestBody{
    planname:string,
    plantype: string,
    amount: number,
    features: string[] | [],
  planduration: number,
    plandurationunit: 'days' | 'weeks' | 'months' | 'years';
    
}




export interface IUserSubscription extends Document {
  user: mongoose.Types.ObjectId;
  subscriptionPlan: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
}