import { messageModel } from "./models/messagemodel.js";

export default class MessageDao {
    constructor(){
        this.model = messageModel
    }
    // Async request to the DB, get All messages with data from users
    async getMessages(){
        try {
            const mensajes = await this.model.find().populate("user", {
                username:1,
                photo:1,
                fullname:1
            })
            return mensajes
        } catch (error) {
            console.log(error);
        }
    }
    // Async request to the DB, get the Last Message to print in the frontend
    async getLastMessage(){
        try {
            const mensajes = await this.model.find().populate("user", {
                username:1,
                photo:1,
                fullname:1
            })
            const mensaje = await mensajes[Object.keys(mensajes)[Object.keys(mensajes).length - 1]]  
            return mensaje
        } catch (error) {
            console.log(error);
        }
    }
    // Async request to the DB, post the message, with the id of the user in the DB
    async postMessages(message,id){
        try {     
            let mensaje;
            if (id != ""){
                mensaje = await this.model.create({
                    message: message,
                    user: id
                })
                
            } else {
                mensaje = await this.model.create({
                    message
                })
                
            }
            mensaje = await mensaje.populate("user", {
                username:1,
                photo:1,
                fullname:1
            });
            return mensaje;
        } catch (error) {
            console.log(error);
        }
    }
}