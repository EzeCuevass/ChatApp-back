import { privateChatModel } from "./models/privatechatmodel.js";

export default class PrivateChatDao {
    constructor() {
        this.model = privateChatModel
    }
    async createPrivateChat(participants) {
        try {
            const privateChat = await this.model.create({
                participants: participants
            })
            return privateChat
        } catch (error) {
            console.log(error);
        }
    }
    async addMessageToPrivateChat(id, message, user) {
        try {
            const privateChat = await this.model.findByIdAndUpdate(
                id,
                { $push: { messages: { message: message, user: user } } },
                { new: true }
            )
            return privateChat
        } catch (error) {
            console.log(error);
        }
    }
    async getPrivateChatById(userId, otrherid) {
        try {
            const privateChat = await this.model.findOne({participants: {$all: [userId, otrherid]}}).populate("participants").populate("messages.user").lean()
            return privateChat
        } catch (error) {
            console.log(error);
        }
    }
}   