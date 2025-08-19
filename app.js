// Imports
import 'dotenv/config'
import express from "express"
import MessageDao from "./dao/message.dao.js"
import { Server } from "socket.io"
import __dirname, { generateToken } from "./utils.js"
import messageRouter from "./routes/message-routes.js"
import { initDB } from "./db/connect.js"
import userRouter from "./routes/user-routes.js"
import initializePassport from "./config/passport.config.js"
import  session  from "express-session"
import MongoStore from "connect-mongo"
import { engine } from "express-handlebars"
import groupRouter from "./routes/group-routes.js"
import cookieParser from "cookie-parser"
import UsersDao from "./dao/users.dao.js"
import GroupDao from "./dao/group.dao.js"
import path from "path"
import { type } from 'os'
import privateRouter from "./routes/private-chat-routes.js"
import cors from "cors";
// DB
initDB()

// Passport
initializePassport()


// Express
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
// Public   
app.use(express.static(path.join(__dirname, 'public')));

//CORS
app.use(cors(
    {
        origin: [process.env.MYFRONT_URL , "http://192.168.100.74:3000" || "http://localhost:3000", process.env.FRONT_URL , "http://192.168.100.74:3000", "0.0.0.0"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
));

// Cookie Parser
app.use(cookieParser())

// Handlebars
app.engine("handlebars", engine({
    defaultLayout:"main",
}))
app.set("view engine", "handlebars") 
app.set("views", process.cwd()+"/views")

// PORT
const PORT = 8080

// Server
const httpServer = app.listen(PORT, () => console.log(`APP OK EN PUERTO ${PORT}`)) 

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:true, 
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl:500
    })
}))
 

// Routes
app.use('/',messageRouter)
app.use('/users',userRouter)
app.use('/group',groupRouter)
app.use('/privatechat',privateRouter)

// Web Socket
const socketServer = new Server(httpServer, {
    cors: {
        // origin: [process.env.MYFRONT_URL, process.env.FRONT_URL],
        origin: [process.env.MYFRONT_URL , "http://192.168.100.74:3000" || "http://localhost:3000", process.env.FRONT_URL , "http://192.168.100.74:3000", "0.0.0.0"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
})

socketServer.on("connection", async(socket)=>{
    const manager = new MessageDao()
    const usermanager = new UsersDao()
    const groupmanager = new GroupDao()
    // Get messages from the global chat.
    socket.on('get', async () => {
        const mensajes = await manager.getMessages()
        socket.emit('mensajesFront', mensajes)
    })
    // Get Messages from a group chat.
    socket.on('getgroup', async (id) => {
        if (typeof id != "string" || id.length != 24){
            return ;
        }
        const groupdata = await groupmanager.getGroupById(id)
        socket.emit('groupFront', groupdata)
    })
    // Send message to global chat
    socket.on('sendmessage', async (message,id) => { 
        // console.log("sendmessage", message, id);
        
        if (id != ""){
            const message_sent = await manager.postMessages(message,id)
            socketServer.emit("newmessagefront", message_sent)
            const lastmessage = await manager.getLastMessage()
            socket.emit('lastmessagefront', lastmessage)
        } else {
            const message_sent = await manager.postMessages(message)
            socketServer.emit("newmessagefront", message_sent)
            const lastmessage = await manager.getLastMessage()
            socket.emit('lastmessagefront', lastmessage)
        }
    })
    // Send message to group
    socket.on('sendmessagetogroup', async(groupid,message,userid) => {
        await groupmanager.postMessageInGroup(groupid,message,userid)
        const mensaje = await groupmanager.getLastMessageInGroup(groupid)
        socketServer.emit("newmessagefrontgroup", {mensaje, groupid})
        let id = groupid
        let lastmessage = mensaje
        socketServer.emit("lastmessagefrontgroup", {lastmessage, id})
    })
    // Get last message in general chat
    socket.on('getlastmessage', async () => {
        const lastmessage = await manager.getLastMessage()
        socket.emit('lastmessagefront', lastmessage)
    })
    // Get last message in group chat
    socket.on('getlastmessageingroup', async (id) => {
        if (typeof id != "string" || id.length != 24){
            return ;
        }
        const lastmessage = await groupmanager.getLastMessageInGroup(id)
        socket.emit('lastmessagefrontgroup', {lastmessage, id})
    })
    socket.on('setusername', ({ username }) => {
        socket.data.username = username;
    });


    // Update the token and user data in the socket 
    socket.on('updateusers', async () => {
        for (let [id,s] of socketServer.sockets.sockets) {
            const username = s.data.username          
            const logedUser = await usermanager.logUser(username)
            let groupsarray = []
            if (logedUser && logedUser.groups && logedUser.groups.length > 0) {
                const groupIds = logedUser.groups
                    .map(g => g.group ? g.group : g)
                    .filter(id => id)
                    .map(id => id.toString())
                    .filter(id => id.length == 24);
                    if (groupIds.length > 0) {
                        groupsarray = await groupmanager.getGroupsById(groupIds)
                    }
                }
            const token = generateToken(
                logedUser.fullname,
                logedUser.username,
                logedUser.email,
                logedUser.photo,
                logedUser._id,
                groupsarray
            )
            s.emit('userupdated', { 
                token, 
                user: {
                    fullname: logedUser.fullname,
                    username: logedUser.username,
                    email: logedUser.email,
                    photo: logedUser.photo,
                    id: logedUser._id,
                    groups: groupsarray
                } 
            })
        }
    })
})