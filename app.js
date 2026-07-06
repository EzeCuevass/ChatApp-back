import 'dotenv/config'
import express from "express"
import path from "path"
import MessageDao from "./dao/message.dao.js"
import { Server } from "socket.io"
import __dirname, { generateToken } from "./utils.js"
import messageRouter from "./routes/message-routes.js"
import { initDB } from "./db/connect.js"
import userRouter from "./routes/user-routes.js"
import initializePassport from "./config/passport.config.js"
import groupRouter from "./routes/group-routes.js"
import cookieParser from "cookie-parser"
import UsersDao from "./dao/users.dao.js"
import GroupDao from "./dao/group.dao.js"
import PrivateChatDao from "./dao/privatechat.dao.js"
import privateRouter from "./routes/private-chat-routes.js"
import cors from "cors";

initDB()
initializePassport()

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cors({
    origin: [process.env.MYFRONT_URL, "http://localhost:3000", process.env.FRONT_URL, "http://192.168.100.74:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(cookieParser())

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')))

const PORT = 8080
const httpServer = app.listen(PORT, () => console.log(`APP OK EN PUERTO ${PORT}`))

// Routes
app.use('/',messageRouter)
app.use('/users',userRouter)
app.use('/group',groupRouter)
app.use('/privatechat',privateRouter)

// Socket.IO
const socketServer = new Server(httpServer, {
    cors: {
        origin: [process.env.MYFRONT_URL, "http://localhost:3000", process.env.FRONT_URL, "http://192.168.100.74:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
})

// Track online users
const onlineUsers = new Map()

socketServer.on("connection", async(socket)=>{
    const manager = new MessageDao()
    const usermanager = new UsersDao()
    const groupmanager = new GroupDao()
    const privateManager = new PrivateChatDao()

    socket.on('setusername', ({ username, userId }) => {
        socket.data.username = username;
        socket.data.userId = userId;
        if (userId) {
            onlineUsers.set(userId, username)
            socketServer.emit('onlineUsers', { userId, username, online: true })
        }
    });

    socket.on('disconnect', () => {
        const uid = socket.data.userId
        if (uid) {
            // Check if user has other sockets still connected
            let stillOnline = false
            for (let [, s] of socketServer.sockets.sockets) {
                if (s.id !== socket.id && s.data.userId === uid) {
                    stillOnline = true
                    break
                }
            }
            if (!stillOnline) {
                onlineUsers.delete(uid)
                socketServer.emit('onlineUsers', { userId: uid, online: false })
            }
        }
    });

    // Send current online list to newly connected socket
    socket.on('getOnlineUsers', () => {
        const list = Array.from(onlineUsers.entries()).map(([userId, username]) => ({ userId, username }))
        socket.emit('onlineUsersList', list)
    });

    // Get messages from the global chat
    socket.on('get', async () => {
        const mensajes = await manager.getMessages()
        socket.emit('mensajesFront', mensajes)
    })

    // Get Messages from a group chat
    socket.on('getgroup', async (id) => {
        if (typeof id != "string" || id.length != 24) return
        const groupdata = await groupmanager.getGroupById(id)
        socket.emit('groupFront', groupdata)
    })

    // Send message to global chat
    socket.on('sendmessage', async (message,id) => {
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
        socketServer.emit("lastmessagefrontgroup", {lastmessage: mensaje, id: groupid})
    })

    // Get last message in general chat
    socket.on('getlastmessage', async () => {
        const lastmessage = await manager.getLastMessage()
        socket.emit('lastmessagefront', lastmessage)
    })

    // Get last message in group chat
    socket.on('getlastmessageingroup', async (id) => {
        if (typeof id != "string" || id.length != 24) return
        const lastmessage = await groupmanager.getLastMessageInGroup(id)
        socket.emit('lastmessagefrontgroup', {lastmessage, id})
    })

    // Private chat
    socket.on('getprivatechat', async (otherUserId, myUserId) => {
        if (typeof otherUserId !== 'string' || otherUserId.length !== 24) return
        let chat = await privateManager.getPrivateChatById(myUserId, otherUserId)
        if (!chat) {
            await privateManager.createPrivateChat([myUserId, otherUserId])
            chat = await privateManager.getPrivateChatById(myUserId, otherUserId)
        }
        socket.emit('privatechatFront', chat)
    })

    socket.on('sendmessagetoprivate', async (chatId, message, userId) => {
        if (!message || !chatId) return
        await privateManager.addMessageToPrivateChat(chatId, message, userId)
        const lastMessage = await privateManager.getLastMessage(chatId)
        socketServer.emit("newmessagefrontprivate", { message: lastMessage, chatId })
        socketServer.emit("lastmessagefrontprivate", { message: lastMessage, chatId })
    })

    socket.on('getprivatechatbyid', async (chatId) => {
        if (typeof chatId !== 'string' || chatId.length !== 24) return
        const chat = await privateManager.getFullChat(chatId)
        socket.emit('privatechatFront', chat)
    })

    socket.on('getlastmessageinprivate', async (chatId) => {
        if (typeof chatId !== 'string' || chatId.length !== 24) return
        const lastMessage = await privateManager.getLastMessage(chatId)
        socket.emit('lastmessagefrontprivate', { message: lastMessage, chatId })
    })

    // Update users across all sockets
    socket.on('updateusers', async () => {
        for (let [,s] of socketServer.sockets.sockets) {
            const username = s.data.username
            if (!username) continue
            const logedUser = await usermanager.logUser(username)
            if (!logedUser) continue
            let groupsarray = []
            if (logedUser.groups && logedUser.groups.length > 0) {
                const groupIds = logedUser.groups
                    .map(g => g.group ? g.group : g)
                    .filter(id => id)
                    .map(id => id.toString())
                    .filter(id => id.length == 24)
                if (groupIds.length > 0) {
                    groupsarray = await groupmanager.getGroupsById(groupIds)
                }
            }
            const privateChats = await privateManager.getChatsByUserId(logedUser._id.toString())
            const token = generateToken(
                logedUser.fullname,
                logedUser.username,
                logedUser.email,
                logedUser.photo,
                logedUser._id,
                groupsarray,
                privateChats
            )
            s.emit('userupdated', {
                token,
                user: {
                    fullname: logedUser.fullname,
                    username: logedUser.username,
                    email: logedUser.email,
                    photo: logedUser.photo,
                    id: logedUser._id,
                    groups: groupsarray,
                    privateChats: privateChats
                }
            })
        }
    })
})
