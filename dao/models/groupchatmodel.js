import { Schema, model } from "mongoose";

const groupSchema = Schema({
    messages: [
        {_id:false,
            message:{type:String, required: true},
            user: {type: Schema.Types.ObjectId, ref:"user"},
            timestamp: {type: Date, default: Date.now}
        }
    ],
    useradmin: {type:Schema.Types.ObjectId, ref: "user"},
    name: {type: String, required: true},
    users: [
        {_id:false,
            user:{type:Schema.Types.ObjectId, ref:"user"}
        }
    ]
})

export const groupModel = model("group", groupSchema)