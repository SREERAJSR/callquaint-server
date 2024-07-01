import mongoose,{Document} from "mongoose";

export interface ChatModel extends Document{
    name: string,
    isGroupChat: boolean,
    lastMessage: mongoose.Types.ObjectId,
    participants: mongoose.Types.ObjectId[],
    admin: mongoose.Types.ObjectId,
   
}