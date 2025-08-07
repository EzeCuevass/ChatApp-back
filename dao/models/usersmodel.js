import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    fullname: {type:String, required: true},
    username: {type:String, required: true, unique:true},
    email: {type:String, required: true, unique:true},
    password: {type:String, required: true},
    photo: {type: String, required: true},
    groups: [
        {_id:false,
            group: {type: Schema.Types.ObjectId, ref:"group"}
        }
    ]
})

export const userModel = model("user", UserSchema) 