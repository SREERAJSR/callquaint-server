import { NextFunction, Request, Response } from "express"
import asyncHandler from "express-async-handler"
import User from "../models/user.model";
import AppError from "../utils/AppError";
import HttpStatus from "../types/constants/http-statuscodes";
import { Chat } from "../models/chat.model";
import mongoose from "mongoose";
import ApiResponse from "../utils/ApiReponse";
import { emitSocketEvent } from "../configs/socket.io";
import { ChatEventEnum } from "../types/constants/socketEventEnums";
import { ChatMessage } from "../models/message.model";
import { Attachment, Participant } from "../types/interfaces/common.interface";
import { removeLocalFile } from "../services/chat.services";

export const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "participants",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
              forgotPasswordToken: 0,
              forgotPasswordExpiry: 0,
              emailVerificationToken: 0,
              emailVerificationExpiry: 0,
              friends: 0,
              channelName: 0,
              requestSend: 0,
              requests: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "chatmessages",
        foreignField: "_id",
        localField: "lastMessage",
        as: "lastMessage",
        pipeline: [
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "sender",
              as: "sender",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    avatar: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              sender: { $first: "$sender" },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

const deleteCascadeChatMessage = async(chatId: string)=>{
  
  const messages = await ChatMessage.find({
    chat: new mongoose.Types.ObjectId(chatId)
  })

  let attachments:Attachment[] = [];

  attachments = attachments.concat(
    ...messages.map((message)=> message.attachments)
  )
  attachments.forEach((attachment) => {
    removeLocalFile(attachment.localPath)
  })

  await ChatMessage.deleteMany({
    chat: new mongoose.Types.ObjectId(chatId)
  })
}



export const getAllChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id as string;
    const chats = await Chat.aggregate([
        {
            $match: {
                participants:{$elemMatch:{$eq:userId}}
            },

        }, {
            $sort: {
                updatedAt:-1
            }
        },
        ...chatCommonAggregation()
    ])

    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,chats || [] ,"Users chats fetched sucessfully"))
})


export const createOrGetAOneOnOneChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { recieverId } = req.params;
    const _id = req.user?._id;
    const reciever = await User.findById(recieverId)

    if (!reciever) {
        throw new AppError("Reciever doesn't exist", HttpStatus.NOT_FOUND);
        return
    }
    if (reciever._id.toString() === _id?.toString()) {
        throw new AppError("You cannot chat yourselft", HttpStatus.BAD_REQUEST)
        return
    }

    const chat = await Chat.aggregate([
        {
            $match: {
                isGroupChat: false,
                $and: [
                    {
                        participants: { $elemMatch: { $eq: _id } }
                    },
                    {
                        participants: { $elemMatch: { $eq: new mongoose.Types.ObjectId(recieverId) } }
                    }
                ]
            }
        }, ...chatCommonAggregation()
    ])

    if (chat.length) {
        res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, chat[0], "chat retrived successfully"));
        return
    }

    const newChatInstance = await Chat.create({
        name: "One on One chat",
        participants: [_id, new mongoose.Types.ObjectId(recieverId)],
        admin:_id
    })

    const createdChat = await Chat.aggregate([
        {
            $match: {
                _id:newChatInstance._id
            }
        },
        ...chatCommonAggregation()
    ])
    const payload = createdChat[0];

    if (!payload) {
        throw new AppError("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        return
    }

    payload?.participants?.forEach((participant: any) => {
        if (participant._id.toString() === _id?.toString()) {
            return 
        }
        emitSocketEvent(req,
            participant?._id?.toString(),
            ChatEventEnum.NEW_CHAT_EVENT, payload)
        
    })

 res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED,payload,"chat retrived sucesfully"))
 
})

export const searchAvailableUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.user?._id;

  const friendsData =await  User.aggregate([
    {
      $match: {
        _id:{$eq: user_id}
      }
    }, {
      $lookup: {
        from: 'users',
        foreignField: "_id",
        localField: "friends",
        as: "friends",
        pipeline: [
          {
             $project: {
                    firstname: 1,
                    avatar: 1,
                    email: 1,
                  }
          }
        ]
      }
    }, {
      $project: {
       friends:1
      }
    }
  ])
const friends = friendsData[0]
  console.log(friends);
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, friends,'friends data fetched succesfully'))
})

export const deleteOneOnOneChat = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  
  const { chatId } = req.params
  console.log(chatId);
  const _id = req.user?._id
  const chat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId)
      },
    },...chatCommonAggregation()
  ])

  const payload = chat[0]
  if (!payload) {
    throw new AppError("Chat doesnot exist",HttpStatus.NOT_FOUND)
  }
  await Chat.findByIdAndDelete(chatId)
  await deleteCascadeChatMessage(chatId)
  const participants = payload.participants as Participant[]
  const otherParticipant = participants.find((
     (participant)=> participant?._id.toString() !== _id?.toString()
  ))
console.log(otherParticipant);
  emitSocketEvent(req, otherParticipant?._id.toString() as string, ChatEventEnum.LEAVE_CHAT_EVENT, payload)
  
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, {}, 'Chat deletedSucessfully'));
})