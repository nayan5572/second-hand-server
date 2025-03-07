import { Types } from "mongoose";
import { IJwtPayload } from "../auth/auth.interface";
import { IUser, TMessagePopulated } from "./message.interface";
import { Message } from "./message.model";


const sendMessage = async (authUser: IJwtPayload, receiverID: string, message: string) => {
    const newMessage = new Message({
        senderID: authUser.userId,
        receiverID,
        message,
        timestamp: new Date(),
    });

    const savedMessage = await newMessage.save();

    const result = await Message.find({
        $or: [
            { senderID: authUser.userId, receiverID: receiverID },
            { senderID: receiverID, receiverID: authUser.userId }
        ]
    })
        .populate('senderID', 'name')
        .populate('receiverID', 'name')
        .sort({ timestamp: 1 });

    const formattedMessages = result.map(message => ({
        sender: message.senderID._id.toString() === authUser.userId ? "you" : "other",
        content: message,
    }));

    return formattedMessages;
};



const getAllMessage = async (authUser: IJwtPayload) => {
    const result = await Message.find({
        $or: [
            { senderID: authUser.userId },
            { receiverID: authUser.userId }
        ]
    })
        .populate('senderID', 'name')
        .populate('receiverID', 'name')
        .sort({ timestamp: -1 });


    const userMessagesMap = new Map<string, any>();

    result.forEach((message: TMessagePopulated) => {
        let otherUser: IUser;
        if (message.senderID && (message.senderID as IUser)._id.toString() !== authUser.userId.toString()) {
            otherUser = message.senderID as IUser;
        } else {
            otherUser = message.receiverID as IUser;
        }


        if (!userMessagesMap.has(otherUser._id.toString())) {
            userMessagesMap.set(otherUser._id.toString(), {
                id: otherUser._id,
                name: otherUser.name,
                lastMessage: message.message,
            });
        }
    });


    const users = Array.from(userMessagesMap.values());

    return users;
};




const getUserMessages = async (authUser: IJwtPayload, targetUserId: string) => {
    const result = await Message.find({
        $or: [
            { senderID: authUser.userId, receiverID: targetUserId },
            { senderID: targetUserId, receiverID: authUser.userId }
        ]
    })
        .populate('senderID', 'name')
        .populate('receiverID', 'name')
        .sort({ createdAt: 1 });

    const formattedMessages = result.map(message => ({
        sender: message.senderID._id.toString() === authUser.userId ? "you" : "other",
        content: message,
    }));
    return formattedMessages;
};



export const messageServices = {
    sendMessage,
    getAllMessage,
    getUserMessages
};
