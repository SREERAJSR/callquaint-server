import { boolean, ref } from "joi";

import mongoose,{Schema} from "mongoose";
import { ChatModel } from "../types/model/chatmodel.interfaces";

const chatSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    isGroupChat: {
        type: Boolean,
        default:false
    },
    lastMessage: {
        type: mongoose.Types.ObjectId,
        ref:'ChatMessage'
    },
    participants: [
        {
            type: mongoose.Types.ObjectId,
            ref:'user'
        }
    ],
    admin: {
        type: mongoose.Types.ObjectId,
        ref:'user'
    }
},
    {
    timestamps:true
    })

export const Chat = mongoose.model<ChatModel>('chat', chatSchema);