import GroupDao from "../dao/group.dao.js";


const groupManager = new GroupDao()

export const createGroup = async (req,res) => {
    try {
        const {useradmin,name} = req.body
        console.log(req.body);
        
        const group = await groupManager.createGroup(useradmin,name)
        res.status(200).json("Group created successfully")
    } catch (error) {
        console.log(error);
    }
}
export const addMembers = async (req,res) => {
    try {
        const {member,idgroup} = req.body
        if (!member || !idgroup) {
            return res.status(400).json({error: "Missing data"})
        }
        
        const useradded = await groupManager.addMemberToGroup(member, idgroup)
        if (useradded){
            res.json("User Added")
        }
        else {
            res.json("User already in group")
        }
    } catch (error) {
        console.log(error);
    }
}
export const postMessageInGroup = async (req,res) => {
    try {
        const {groupid,message,userid} = req.body
        const messageingroup = await groupManager.postMessageInGroup(groupid,message,userid)
        res.json(messageingroup)
    } catch (error) {
        console.log(error);
    }
}

export const getGroupById = async (req,res) => {
    try {
        const {id} = req.query
        const groupDetails = await groupManager.getGroupById(id)
        res.status(200).json(groupDetails)
    } catch (error) {
        console.log(error);
    }
}
export const getLastMessageInGroup = async (req,res) => {
    try {
        const {id} = req.query
        const lastmessage = await groupManager.getLastMessageInGroup(id)
        res.status(200).json(lastmessage)
    } catch (error) {
        console.log(error);
    }
}
export const deleteGroup = async (req,res) => {
    try {
        const {id} = req.query
        await groupManager.deleteGroup(id)
        res.status(200).json("Group deleted successfully")
    } catch (error) {
        console.log(error);
    }
}