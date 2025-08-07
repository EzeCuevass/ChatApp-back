import MessageDao from "../dao/message.dao.js";

const manager = new MessageDao();

export const home = async (req,res)=>{
    try {
        const messages = await manager.getMessages()
        res.status(200).json(messages)
        // HBS 
        // res.render("home",{session:req.session.user})
    } catch (error) {
        console.log(error);
        res.json(error)
    }
}
export const postMessage = async (req,res)=> {
    const message = req.body.message;
    await manager.postMessages(message)
    res.status(200).json("Mensaje Recibido!")
}

export const getLastMessage = async (req,res)=> {
    const lastmessage = await manager.getLastMessage()
    
    res.status(200).json(lastmessage)
}