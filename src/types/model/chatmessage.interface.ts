import mongoose, { Document } from "mongoose";

type AttachmentType ={
    url: string,
    localPath:string
}

export interface IChatMessageDocument extends Document{
    sender: mongoose.Types.ObjectId,
    content: string,
    attachments: AttachmentType[]| [],
    chat:mongoose.Types.ObjectId
}