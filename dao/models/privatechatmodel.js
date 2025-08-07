import { Schema, model } from "mongoose";

const privateChatSchema = new Schema({
    participants: [
        { type: Schema.Types.ObjectId, ref: "user"},
    ],
    messages: [
        {
            message: { type: String, required: true },
            user: { type: Schema.Types.ObjectId, ref: "user" }
        }
    ]})
export const privateChatModel = model("privateChat", privateChatSchema)