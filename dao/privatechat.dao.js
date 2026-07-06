import { privateChatModel } from "./models/privatechatmodel.js";

export default class PrivateChatDao {
    constructor() {
        this.model = privateChatModel;
    }
    async createPrivateChat(participants) {
        try {
            const chat = await this.model.create({ participants });
            return chat;
        } catch (error) {
            console.log(error);
        }
    }
    async addMessageToPrivateChat(chatId, message, userId) {
        try {
            const updated = await this.model.findByIdAndUpdate(
                chatId,
                { $push: { messages: { message, user: userId } } },
                { new: true }
            );
            return updated;
        } catch (error) {
            console.log(error);
        }
    }
    async getPrivateChatById(userA, userB) {
        try {
            const chat = await this.model
                .findOne({ participants: { $all: [userA, userB] } })
                .populate("participants", "username fullname photo _id")
                .populate("messages.user", "username _id")
                .lean();
            return chat;
        } catch (error) {
            console.log(error);
        }
    }
    async getFullChat(chatId) {
        try {
            const chat = await this.model
                .findById(chatId)
                .populate("participants", "username fullname photo _id")
                .populate("messages.user", "username _id")
                .lean();
            return chat;
        } catch (error) {
            console.log(error);
        }
    }
    async getChatsByUserId(userId) {
        try {
            const chats = await this.model
                .find({ participants: userId })
                .populate("participants", "username fullname photo _id")
                .lean();
            return chats;
        } catch (error) {
            console.log(error);
        }
    }
    async getLastMessage(chatId) {
        try {
            const chat = await this.model
                .findById(chatId)
                .populate("messages.user", "username _id")
                .lean();
            if (!chat || !chat.messages.length) return null;
            return chat.messages[chat.messages.length - 1];
        } catch (error) {
            console.log(error);
        }
    }
}
