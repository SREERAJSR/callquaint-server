import { NextFunction, Request, Response } from "express"
import  asynchHandler from "express-async-handler"
import { Chat } from "../models/chat.model";
import AppError from "../utils/AppError";
import HttpStatus from "../types/constants/http-statuscodes";
import mongoose, { mongo } from "mongoose";
import { ChatMessage } from "../models/message.model";
import ApiResponse from "../utils/ApiReponse";
import { endWith } from "rxjs";
import { CustomRequest } from "../types/app.interfaces";
import { emitSocketEvent } from "../configs/socket.io";
import { ChatEventEnum } from "../types/constants/socketEventEnums";
import { removeLocalFile } from "../services/chat.services";

export const chatMessageCommonAggregation = () => {
    return [
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "sender",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            firstname: 1,
                            avatar: 1,
                            email:1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                sender:{$first:"$sender"}
            }
        }
    ]
}


export const getStaticPath = (req:CustomRequest,fileName:string) => {
    return `${req.protocol}://${req.get('host')}/images/${fileName}`
}

export const getLocalPath = (fileName:string) => {
    return `public/images/${fileName}`;
}


export const getAllMessages = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    const _id = req.user?._id;

    const selectedChat = await Chat.findById(chatId);

    if (!selectedChat)
        throw new AppError("This chat doesn't exist", HttpStatus.NOT_FOUND)
    
    if (!selectedChat.participants.includes(new mongoose.Types.ObjectId(_id))) {
        throw new AppError("user is not a part of this chat", HttpStatus.BAD_REQUEST)
        return
    }

    const messages = await ChatMessage.aggregate([
        {
            $match: {
                chat: new mongoose.Types.ObjectId(chatId)
            }
        },
        ...chatMessageCommonAggregation(),
        {
            $sort: {
                createdAt:-1
            }
        }

    ])
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, messages || [], 'Messages fetched succesfully'));
})

export const sendMessage = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {
    const reqF = req as CustomRequest
    const { chatId } = req.params
    const _id = req.user?._id
    const { content } = req.body;
    if (!content && !reqF.files?.attachments?.length) {
        throw new AppError("Message content  or attachment is required", HttpStatus.BAD_REQUEST);
    }
    const selectedChat = await Chat.findById(chatId);
    if (!selectedChat) throw new AppError("Chat does not exist", HttpStatus.NOT_FOUND)
    
    const messageFiles:{url:string,localPath:string}[] = [];

    if (reqF.files && reqF.files?.attachments?.length! > 0) {
        reqF.files.attachments?.map((attachment) => {
            messageFiles.push({
                url: getStaticPath(reqF, attachment.filename),
                localPath:getLocalPath(attachment.filename)
            })
        })
    }

    const message = await ChatMessage.create({
        sender: new mongoose.Types.ObjectId(_id),
        content: content || '',
        chat: new mongoose.Types.ObjectId(chatId),
        attachments:messageFiles
    })

    const chat = await Chat.findByIdAndUpdate(chatId,
        {
            $set: {
                lastMessage:message._id
            }
        },
        {new:true}
    )

    const messages = await ChatMessage.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(message.id)
            }
        },
        ...chatMessageCommonAggregation()
    ])

    const recievedMessage = messages[0];

    if (!recievedMessage) {
        throw new AppError("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR)
    }

    chat?.participants.forEach((participantObjectId) => {
        if (participantObjectId.toString() === _id?.toString()) return 
        
        emitSocketEvent(reqF,participantObjectId.toString(),ChatEventEnum.MESSAGE_RECEIVED_EVENT,recievedMessage)
    })
     res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED,recievedMessage,"messages saved sucessfully"))
})

export const deleteMessage = asynchHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const { chatId, messageId } = req.params;
    const _id = req.user?._id
    const chat = await Chat.findOne({
        _id: new mongoose.Types.ObjectId(chatId),
        participants:_id
    })

    if (!chat) {
        throw new AppError("Chat does not exist", HttpStatus.NOT_FOUND)
        return
    }
    const message = await ChatMessage.findById(new mongoose.Types.ObjectId(messageId))
    
    if (!message) {
        throw new AppError("Message doesn't not exist", HttpStatus.NOT_FOUND)
        return
    }

    if (message.sender._id.toString() !== _id?.toString()) {
        throw new AppError("You are not authorized to delete the message,you are not the sender", HttpStatus.FORBIDDEN)
        return
    }
    if (message.attachments.length > 0) {
        message.attachments.map((asset) => {
            removeLocalFile(asset.localPath)
        })
    }

    await ChatMessage.deleteOne({
        _id: new mongoose.Types.ObjectId(messageId) 
    })

    if (chat.lastMessage.toString() === message._id.toString()) {
        const lastMessage = await ChatMessage.findOne(
            { chat: new mongoose.Types.ObjectId(chatId) },
            {},
            {sort:{createdAt:-1}}
        )
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage:lastMessage?lastMessage.id:null
        }
        )
    }
    chat.participants.forEach((participantObjectId) => {
        if (participantObjectId.toString() === _id.toString()) return
        emitSocketEvent(req,participantObjectId.toString(),ChatEventEnum.MESSAGE_DELETE_EVENT,message)
    })

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,message,"Message deleted succesfully",))

})