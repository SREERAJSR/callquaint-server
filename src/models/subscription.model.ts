import mongoose, { Schema } from "mongoose";
import { IsubscriptionPlan } from "../types/model/subscriptionmodel.interface";


const subscriptionPlanSchema = new Schema({
    planname: {
        type: String,
        required: true,
        unique:true,
      trim:true
    },
    plantype: {
        type: String,
        required:true
    },
    amount: {
        type:Number,
        required: true,
        min:0
    },
    features: {
        type: [
            {
                type:String
            }
        ],default:[]
    },
    planduration: {
        type: Number,
        required: true,
        min:1
    },
    plandurationunit: {
        type: String,
        required: true,
        enum: ['days', 'weeks', 'months', 'years']
    }

},
)

export const Subscription = mongoose.model<IsubscriptionPlan>('subscription',subscriptionPlanSchema)



// subscriptionPlanSchema.virtual('plandurationEndDate').get(function () {
//     const now = new Date()
//     switch (this.plandurationUnit) {
//         case 'days':
//             return new Date(now.setDate(now.getDate() + this.planduration))
//         case 'weeks':
//             return new Date(now.setDate(now.getDate() + this.planduration * 7))
//         case 'months':
//             return new Date(now.setMonth(now.getMonth() + this.planduration))
//         case 'years':
//             return new Date(now.setFullYear(now.getFullYear() + this.planduration))
//         default:
//             return null
//     }
// })