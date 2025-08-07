import {Schema, model} from "mongoose";

const messageSchema = new Schema({
    message: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref:"user"},
    timestamp: {type: Date, default: Date.now}
})

export const messageModel = model("messages", messageSchema) 