import { Types } from "mongoose";

export interface TMessage {
    _id?: Types.ObjectId;
    senderID: Types.ObjectId;
    receiverID: Types.ObjectId;
    message: string;
    timestamp?: Date;
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
}


export interface TMessagePopulated {
    _id?: Types.ObjectId;
    senderID: IUser | Types.ObjectId;
    receiverID: IUser | Types.ObjectId;
    message: string;
    timestamp?: Date;
}

export interface IUser {
    _id: Types.ObjectId;
    name: string;
}
