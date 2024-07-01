import mongoose from "mongoose";
import { CallInfoModel } from "../types/model/callinfomodel.interface";

export const callInfoSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        callInfo: [{
            remoteUserId: {
                type: mongoose.Types.ObjectId,
                ref: 'user', 
            },
            callDuration: {
                type:String,
                required: true
            },
            date: {
                type: Date,
            },
            requestSent: {
                type: Boolean,
                default:false
            },
            friend: {
                type:Boolean
            }
        }]
    });


const CallInfo = mongoose.model<CallInfoModel>('callInformation', callInfoSchema)
export default CallInfo;