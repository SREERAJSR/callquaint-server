import cookie from 'cookie';
import { Socket ,Server} from "socket.io";
import AppError from '../utils/AppError';
import HttpStatus from '../types/constants/http-statuscodes';   
import { JwtPayload, verify } from 'jsonwebtoken';
import configKey from './configkeys';
import User from '../models/user.model';
import { CustomSocketInterface, RequestSocketInterface } from '../types/socket.interface';
import { ChatEventEnum } from '../types/constants/socketEventEnums';
import { Application, NextFunction, Request,Response } from 'express';
import { AcceptCallPayload } from '../types/interfaces/common.interface';


export interface OnlineUsers{
    userId: string,
    name:string
}
let onlineUsers: Map<string,OnlineUsers> = new Map<string,OnlineUsers>()

const emitOnlineUsersEvent = (io: Server) => {
    io.emit(ChatEventEnum.ONLINEUSERS, Array.from(onlineUsers.values()))
}
const mountJoinEvent = (socket: CustomSocketInterface) => { 
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId:string) => {
        console.log(`User joined the chat 🤝. chatId: `, chatId);
        socket.join(chatId) 
    })
}
const mountParticipantTypingEvent = (socket: CustomSocketInterface) => {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
        console.log(chatId, 'typing')
        socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT,chatId)
    })
}
const mountParticipantStopTypingEvent = (socket: CustomSocketInterface) => {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
         console.log(chatId, 'notyping')
        socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT,chatId)
    })
}

const mountGetOnlineUsersEvent = (socket: CustomSocketInterface) => {
    socket.on(ChatEventEnum.GETONLINEUSER, () => {
        socket.emit(ChatEventEnum.ONLINEUSERS,Array.from(onlineUsers.values()))
    })
}

const mountRequestCallEvent = (socket: CustomSocketInterface) => {
    socket.on(ChatEventEnum.CALL_REQUEST, (payload: AcceptCallPayload) => {
        console.log(payload);
genericEmitSocketEventFn(socket,payload.remoteId.toString(),ChatEventEnum.CALL_REQUEST,payload)
    })
}
export const initializeIo = (io: Server) => {
    return io.on('connection', async (socket:CustomSocketInterface) => {
        try {
            const cookies = cookie.parse(socket.handshake?.headers?.cookie || '');
            let token = cookies?.accessToken;

            if (!token)
                token = socket.handshake.auth?.token;
 
            if (!token) {
                throw new AppError("Un-authorized handshake. Token is missing", HttpStatus.UNAUTHORIZED);
            }
            const decodedToken:JwtPayload = verify(token, configKey().ACCESS_TOKEN_SECRET) as JwtPayload;

            const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
            if (!user) {
                throw new AppError("Un-authorized handshake. Token is invalid", HttpStatus.UNAUTHORIZED);
            }
            socket.user = user;

            socket.join(user?._id.toString());
            socket.emit(ChatEventEnum.CONNECTED_EVENT, 'connected')
            const userId = user?._id.toString()
            console.log('User connected 🗼. userId: ', user._id.toString());
            if (userId) {
                onlineUsers.set(userId,{userId:user._id.toString(),name:user.firstname}) 
            }
            emitOnlineUsersEvent(io)
            mountJoinEvent(socket)
            mountParticipantTypingEvent(socket)
            mountParticipantStopTypingEvent(socket)
            mountGetOnlineUsersEvent(socket)
            mountRequestCallEvent(socket)
            console.log(onlineUsers);
            socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
                console.log("user has disconnected 🚫. userId: " + socket.user?._id);
                if (socket.user?._id) {
                    onlineUsers.delete(socket.user._id.toString())
              socket.leave(socket.user._id);
                }
                emitOnlineUsersEvent(io)
            })
        } catch (error) {
            socket.emit(ChatEventEnum.SOCKET_ERROR_EVENT,
                (error as Error)?.message || "Something went wrong while connecting to the socket."
            )
            
        }
    })
}


export const emitSocketEvent = (req: Request, roomId: string, event: string, payload: any) => {
    
    (req.app.get('io') as Socket).in(roomId).emit(event, payload);
}
export const genericEmitSocketEventFn = (socket: Socket, roomId: string, event: string, payload: any) => {
    socket.in(roomId).emit(event,payload)
} 