import mongoose, { Schema, mongo } from "mongoose";
import { IChatMessageDocument } from "../types/model/chatmessage.interface";

const chatMessageSchema = new Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref:'user'
    },
    content: {
        type: String,
    },
    attachments: {
        type: [
            {
                url: String,
                localPath:String
            }
        ],
        default:[]
    },
    chat: {
        type: Schema.Types.ObjectId,
        ref:'chat'
    }

}, {
    timestamps:true
})

export const ChatMessage =  mongoose.model<IChatMessageDocument>('chatmessage',chatMessageSchema)