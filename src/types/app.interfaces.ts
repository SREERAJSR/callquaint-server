import { Request } from "express";

export interface AccessTokenAndrefreshTokenInterface{
    accessToken: string;
    refreshToken: string;
    
}

export interface ConnectUserInterface {
    channelName: string,
    gender: string,
    target:string
}

export interface CustomRequest extends Request {
  files?: {
      attachments?: Express.Multer.File[];
  };
}