import { groupModel } from "./models/groupchatmodel.js";
import { userModel } from "./models/usersmodel.js";

export default class GroupDao{
    constructor(){
        this.model = groupModel
    }
    async createGroup(useradmin, name){
        try {
            const group = await this.model.create({
                useradmin: useradmin,
                name: name,
                users: [{user: useradmin}],
            })
            await userModel.findByIdAndUpdate(
                    useradmin,
                    {$push: {groups: {group: group._id}}},
                    {new:true}
                )
            return group
        } catch (error) {
            console.log(error);
        }
    }
    async addMemberToGroup(member,idgroup){
        try {
            const isMember = await this.isMemberInGroup(member,idgroup)
            if (!isMember){
                const membernew = await this.model.findByIdAndUpdate({_id:idgroup}, 
                    {$push: {users: {user: member}}},
                    {new:true}
                )
                await userModel.findByIdAndUpdate(
                    member,
                    {$push: {groups: {group: idgroup}}},
                    {new:true}
                )
                return membernew
            } else {
                const membernew = "The member is already in group"
                return membernew
            }
        } catch (error) {
            console.log(error);
        }
    }
    async isMemberInGroup(member,idgroup){
        try {
            
            const isMember = await this.model.findOne({
                idgroup,
                users: {$elemMatch: {user:member}}
            })
            return isMember
        } catch (error) {
            console.log();
        }
    }
    async getGroupById(idgroup){
        try {
            const groupid = await this.model.findById(idgroup).populate("useradmin").populate("users.user").populate("messages.user").lean()
            return groupid
        } catch (error) {
            console.log(error);
        }
    }
    async postMessageInGroup(groupid,message,userid){
        try {
            const mensaje = await this.model.findByIdAndUpdate({_id:groupid}, 
                {$push: {messages: {message: message,
                    user:userid
                }}},
                {new:true}
            )
            return mensaje
        } catch (error) {
            console.log(error);
        }
    }
    async getLastMessageInGroup(idgroup){
        try {
            const mensajes = await this.model.findById(idgroup).populate("messages.user")
            const mensajesgrupo = mensajes.messages
            const mensaje = mensajesgrupo[Object.keys(mensajesgrupo)[Object.keys(mensajesgrupo).length - 1]]
            return mensaje
        } catch (error) {
            console.log(error);
        }
    }
    async getGroupsById(groups){
        try {
            const groupsid = await this.model.find({_id: {$in: groups}}, {_id: 1 , name: 1}).populate("useradmin").populate("users.user").lean()
            return groupsid
        } catch (error) {
            console.log(error);
        }
    }
    async deleteGroup(id){
        try {
            await this.model.findByIdAndDelete(id)
            await userModel.updateMany(
                {},
                {$pull: {groups: {group: id}}}
            )
            return "Group deleted successfully"
        } catch (error) {
            console.log(error);
        }
    }
}