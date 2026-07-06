import PrivateChatDao from "../dao/privatechat.dao.js";

const manager = new PrivateChatDao();

export const getPrivateChat = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const myid = req.user.sub;

        const privateChat = await manager.getPrivateChatById(myid, otherUserId);
        if (!privateChat) {
            const newChat = await manager.createPrivateChat([myid, otherUserId]);
            const full = await manager.getPrivateChatById(myid, otherUserId);
            return res.json(full);
        }
        res.json(privateChat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export const addMessageToPrivateChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const myid = req.user.sub;
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Falta el mensaje" });

        await manager.addMessageToPrivateChat(chatId, message, myid);
        const updated = await manager.getFullChat(chatId);
        res.json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export const getMyPrivateChats = async (req, res) => {
    try {
        const myid = req.user.sub;
        const chats = await manager.getChatsByUserId(myid);
        res.json(chats);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};
