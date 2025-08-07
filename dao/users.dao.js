import { userModel } from "./models/usersmodel.js";

export default class UsersDao{
    async registerUser(obj){
        try {
            const newuser =await userModel.create(obj)
            return newuser
    } catch (error) {
        console.log(error);
        return error
    }}
    async logUser(username){
        try {
            const finduser = await userModel.findOne({username})
            if (finduser !=""){
                return finduser
            } else {
                return "No se encontro al usuario"
            }
        } catch (error) {
            console.log(error);
        }
    }
    async searchUser(username){
        try {
            const finduser = await userModel.findOne({username}).populate("groups.group")
            return finduser
        } catch (error) {
            console.log(error);
        }
    }
    async getById(id){
        try {
            const finduser = await userModel.findById(id).populate("groups.group")
            return finduser
        } catch (error) {
            console.log(error);
        }
    }
    async searchUsers(username){
        try {
            const regex = new RegExp('^' + username, 'i');
            const finduser = await userModel.find({username:regex}).populate("groups.group", {
                "useradmin":1,
                "name":1,
                "_id":1
            })
            return finduser
        } catch (error) {
            console.log(error);
        }
    }
}