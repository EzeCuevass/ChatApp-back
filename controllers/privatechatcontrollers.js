import PrivateChatDao from "../dao/privatechat.dao.js";


const privateChatManager = new PrivateChatDao();

export const getPrivateChat = async (req, res) => {
    try {
        const { userId } = req.query;
        console.log(userId);
        
        const myid = req.session.user.id;
        const privateChat = await privateChatManager.getPrivateChatById(myid, userId);
        if (!privateChat) {
            const newPrivateChat = await privateChatManager.createPrivateChat([myid, userId]);
            res.json(newPrivateChat);
        } else {
            res.json(privateChat);
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
export const addMessageToPrivateChat = async (req, res) => {
    try {
        const id  = req.params.id;
        const myid = req.session.user.id;
        const {message}  = req.body;

        const privateChat = await privateChatManager.getPrivateChatById(myid, id);

        const privateChatMessage = await privateChatManager.addMessageToPrivateChat(privateChat, message, myid);
        res.json(privateChatMessage);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}