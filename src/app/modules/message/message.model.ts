import { model, Schema } from "mongoose";
import { TMessage } from "./message.interface";

const messageSchema = new Schema<TMessage>({
    senderID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender ID is required']
    },
    receiverID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Receiver ID is required']
    },
    message: {
        type: String,
        required: [true, 'Message content is required']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

export const Message = model<TMessage>("Message", messageSchema);
