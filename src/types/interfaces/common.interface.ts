import mongoose, { Document } from "mongoose";

export interface Attachment {
    url: string
    localPath:string
}


interface Avatar {
    url: string;
    localPath: string;
    _id: string;
}

export interface Participant {
    _id: string;
    avatar: Avatar;
    username: string;
    email: string;
    role: string;
    loginType: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface ChatInterface {
    participants?: Participant[];

}


export interface AcceptCallPayload{
  uid: string;
  channelName: string,
    callerName: string,
    remoteId: string,
    callType?:string
}

  interface remoteUserInfo{
     _id: mongoose.Types.ObjectId
      firstname: string
      lastname: string
  }
export interface CallHistoryItem {
  remoteUserId:remoteUserInfo
  callDuration: string;
  date: Date;
  requestSent?: boolean;
  friend?: boolean; 

}

export interface AdminCustomRequest extends Request{
  admin?: Document;
}

