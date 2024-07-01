import { NextFunction, Request, Response } from 'express';
import asyncHanlder from 'express-async-handler';
import User from '../models/user.model';
import AppError from '../utils/AppError';
import HttpStatus from '../types/constants/http-statuscodes';
import ApiResponse from '../utils/ApiReponse';
import { ConnectUserInterface } from '../types/app.interfaces';
import { ConnectTargetEnums } from '../types/constants/common.constant';
import CallInfo from '../models/callInfo.model';
import mongoose, { Date, Schema, mongo } from 'mongoose';
import { CallHistoryItem } from '../types/interfaces/common.interface';


const selfHost:Set<ConnectUserInterface> = new Set<ConnectUserInterface>();
export const callSetup = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.query);
  const { target } = req.query;
  const userid = req.user?._id;
  const user = await User.findById(userid);
 
  if (!user) throw new AppError("unauthorized", HttpStatus.UNAUTHORIZED);
  const userObject = { channelName: user.channelName, gender: user.gender, target: target } as ConnectUserInterface;

  if (target === ConnectTargetEnums.ANY) {
    const matchedAnyUsers = getRandomUsersByAnyTarget(target as string, userObject);
    console.log(matchedAnyUsers,'match match match');
    if (matchedAnyUsers.length > 0) {
      const randomRemoteUser = getRandomUser(matchedAnyUsers);
      selfHost.delete(randomRemoteUser);   
      res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, randomRemoteUser, 'user got a remote user'));
      res.end(); 
      return; // Early return to prevent further execution
    }
  } else if (target === ConnectTargetEnums.MALE || target === ConnectTargetEnums.FEMALE) {
    const matchedTargetUsers = getRandomUsersByTarget(target as string, userObject);
    if (matchedTargetUsers.length > 0) { 
      const randomRemoteUser = getRandomUser(matchedTargetUsers);
      selfHost.delete(randomRemoteUser);
      res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, randomRemoteUser, 'user got a remote user'));
      res.end();  
      return; // Early return c
    } 
  }
  
  // If no target user is found
  selfHost.add(userObject);
  console.log(selfHost);
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, userObject, 'user is self hosted'));
  res.end();
})
export const removeListener = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id
  const user = await User.findById(new mongoose.Types.ObjectId(_id))
  const channelName = user?.channelName.toString();
  if (!channelName) {
    throw new AppError("Channel name not found",HttpStatus.BAD_REQUEST)
}
  let userToRemove: ConnectUserInterface | null = null
  
  for (let user of selfHost) {
    if (user.channelName.toString() === channelName?.toString()) {
      userToRemove = user
      break;
    }
  }

  if (userToRemove) {
    selfHost.delete(userToRemove)
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,{},'user removed from selfhosted'))
  } else {
    res.status(HttpStatus.NOT_FOUND).json(new ApiResponse(HttpStatus.NOT_FOUND,{},'user Not found in selfhost '))
  }

})
export const saveCallInfoToDb = asyncHanlder(async(req: Request, res: Response, next: NextFunction)=>{
  
  const { remoteId, duration, date } = req.body;
  const formattedDuration = secondsToTimeString(Number(duration));
  const _id = req.user?._id;
  const user = await User.findById(_id);
  if (!user) throw new AppError("unauthorized", HttpStatus.UNAUTHORIZED);

  const existedCallInfo = await CallInfo.findOne({ userId: _id });
  if (!existedCallInfo) {
    const newCallInfo = new CallInfo({
      userId: _id,
      callInfo:[]  
    })
    newCallInfo.callInfo.push({ remoteUserId: remoteId, callDuration: formattedDuration ,date:date})
    await newCallInfo.save({ validateBeforeSave: false })
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, {}, "callinformation updated"))
    return
  } else {
    let isRequestSent: boolean = false;
    existedCallInfo.callInfo.forEach((info) => {
      if (info.remoteUserId.toString() === remoteId.toString() && info.requestSent === true) {
        isRequestSent=true
      }
    })
    existedCallInfo.callInfo.push({ remoteUserId: remoteId, callDuration:formattedDuration ,date:date ,requestSent:isRequestSent})
    await existedCallInfo.save({ validateBeforeSave: false })
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, {}, "callinformation updated"))
    return
  } 

})



export const getCallHistory = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id;

  const existedCallInfo = await CallInfo.findOne({ userId: _id }).populate('callInfo.remoteUserId', 'firstname lastname ') as any
  
  if (!existedCallInfo) { 
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, [], 'No call history found for this user'));
    return;
  }

  let callhistory:CallHistoryItem[]= [...existedCallInfo.callInfo] 
  const user = await User.findById(new mongoose.Types.ObjectId(_id)).select('friends')
  const friendsSet = new Set(user?.friends.map((friend) => friend.toString()))
  callhistory.forEach((history) => {
    const remoteUserId = history.remoteUserId._id.toString()
    console.log(friendsSet.has(remoteUserId));
    if (friendsSet.has(remoteUserId)) {
      history.friend= true
    } else {
      history.friend = false
    }
  })

callhistory.sort((a, b) => {
  const dateA = new Date(a.date as any);
  const dateB = new Date(b.date as any);
  return dateB.getTime() - dateA.getTime();
});
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,callhistory , 'call history recieved'));

})

export const sendFriendRequest = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const { remoteId } = req.body as {remoteId :string}
  console.log(req.body);
  const _id = req.user?._id;
  const user = await User.findById(_id);
  if (!user) {
    throw new AppError('unauthorized', HttpStatus.UNAUTHORIZED)
    return;
  }

  if (user.friends.includes(new mongoose.Types.ObjectId(remoteId))) {
      throw new AppError("You are already friends now",HttpStatus.BAD_REQUEST)
  }
   const callHistory = await CallInfo.findOne({userId:new mongoose.Types.ObjectId(_id)});
  if (!callHistory) {
    throw new AppError("Not authorized user", HttpStatus.UNAUTHORIZED);
    return;
  }
  const remoteUser = await User.findById(new mongoose.Types.ObjectId(remoteId));
  if (!remoteUser) {
    throw new AppError("No user in this id", HttpStatus.BAD_REQUEST)
    return
  }
callHistory.callInfo.forEach((info) => {  
    if (info.remoteUserId.toString() ==remoteId) {
      info.requestSent = true;
   }
  })

  if (user.requestSent.includes(new mongoose.Types.ObjectId(remoteId))) {
    throw new AppError("Already you have sent request", HttpStatus.BAD_REQUEST)
    return;
  };
  user.requestSent.push(new mongoose.Types.ObjectId(remoteId));
 
  remoteUser.requests.push(user._id);
  
  await remoteUser.save({validateBeforeSave:false})
  await callHistory.save({ validateBeforeSave: false });
  await user.save({ validateBeforeSave: false });

   let callhistory = callHistory.callInfo; 
    // Sort the call history by date in descending order
callhistory.sort((a, b) => {
  const dateA = new Date(a.date as any);
  const dateB = new Date(b.date as any);
  return dateB.getTime() - dateA.getTime();
});
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, callHistory, "request sent sucessfully"));
})

export const fetchFriendRequestsFromDb = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id;

  const user = await User.findById(_id).populate('requests','firstname')
  if (!user) {
    throw new AppError("unauthorized user", HttpStatus.UNAUTHORIZED);
    return;
  }
  const requests = user.requests.reverse();
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,requests,"sucessfully fetched friend requests"))
})

export const acceptFriendRequest = asyncHanlder( async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id;
  const { remoteId } = req.body as {remoteId:string};
  const user = await User.findById(_id);
  if (!user) {
  throw new AppError("unauthorized user", HttpStatus.UNAUTHORIZED);
    return;
  }
  const remoteUser = await User.findById(new mongoose.Types.ObjectId(remoteId));
  user.requests.forEach((reqstId,index) => {
    if (reqstId.toString() == remoteId.toString()) {
     user.friends.push(user.requests.splice(index, 1)[0]);
    }
  })
  if (remoteUser?.requestSent.includes(user._id))
    remoteUser.friends.push(user._id);
  await remoteUser?.save({validateBeforeSave:false}) 
  await user.save({ validateBeforeSave: false })
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,{},"friend request accepted succesfully"))
})

export const rejectFriendRequest = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id;
  const { id: remoteId } = req.query;
  const rejected = await User.findByIdAndUpdate(_id, {
    $pull: { requests: remoteId }
  }, { new: true })
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,{},"friend request reject succesfully"))

})

export const fetchFriendsList = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id;
  const user = await User.findById(_id).populate('friends', 'firstname');
  if (!user) {
        throw new AppError("unauthorized user", HttpStatus.UNAUTHORIZED);
    return;
  }
  const friendsList = user.friends;
      res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,friendsList,"friends list fetched succesfully"))
})


export const getChannelName = asyncHanlder(async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.user?._id
  const channelName = await User.findById(_id).select('channelName')
  console.log(channelName);
  if (!channelName) {
    throw new AppError("user doesnot exist", HttpStatus.BAD_REQUEST)
    return
  }
  res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK,channelName || {channelName:'channel123'}  ,"channel name fetched succesfully"))


})



function getRandomUsersByAnyTarget(target: string, userObject: ConnectUserInterface) {
    return [...selfHost].filter((user) => (user.target === userObject.gender) || (user.target ===userObject.target)  )
}
function getRandomUsersByTarget(target: string, userObject: ConnectUserInterface) {
    return [...selfHost].filter((user)=>(user.target===userObject.gender && userObject.target===user.gender) ||user.gender ===userObject.target ) 
}          
function getRandomUser(checkArray:ConnectUserInterface[]) {
  const randomIndex = Math.floor(Math.random() * checkArray.length);
  console.log(randomIndex,'randi');
    return checkArray[randomIndex]  
}  


function secondsToTimeString(seconds: number): string {
  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = seconds % 60;

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  // Return the time string in the format "minutes:seconds"
  return `${formattedMinutes}:${formattedSeconds}`;
}
