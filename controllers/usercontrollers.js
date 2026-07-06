import UsersDao from "../dao/users.dao.js";
import { generateToken } from "../utils.js";
import GroupDao from "../dao/group.dao.js";
import PrivateChatDao from "../dao/privatechat.dao.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import __dirname from "../utils.js";

const usermanager = new UsersDao();
const groupManager = new GroupDao();
const privateChatManager = new PrivateChatDao();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public", "uploads"));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
        cb(null, ok);
    }
}).single("photo");

export const uploadPhoto = (req, res) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        }
        if (err) {
            return res.status(400).json({ error: "Formato no permitido" });
        }
        if (!req.file) {
            return res.status(400).json({ error: "No se subió ninguna imagen" });
        }
        const url = `/uploads/${req.file.filename}`;
        res.json({ url });
    });
};

export const register = async (req,res) => {
    try {
        res.status(200).json({message: "User registered successfully"})
    } catch (error) {
        res.json(error)
        console.log(error);
    }
}
export const login = async (req,res) => {
        try { 
            const loguser = await usermanager.logUser(req.body.username)
            let groupsarray = []
            if (loguser.groups && loguser.groups.length > 0) {
                const groupIds = loguser.groups
                    .map(g => g.group ? g.group : g)
                    .filter(id => id) 
                    .map(id => id.toString())
                    .filter(id => id.length==24);
                if (groupIds.length > 0) {
                    groupsarray = await groupManager.getGroupsById(groupIds)
                }
            }
            const privateChats = await privateChatManager.getChatsByUserId(loguser._id.toString())
            const userData = {
                fullname: loguser.fullname,
                username: loguser.username,
                email: loguser.email,
                photo: loguser.photo,
                id: loguser._id,
                groups: groupsarray,
                privateChats: privateChats
            }
            const token = generateToken(
                loguser.fullname,
                loguser.username,
                loguser.email,
                loguser.photo,
                loguser._id,
                groupsarray,
                privateChats
            )
            res.cookie("currentUser", token, {
                maxAge:24*60*60*60,
                sameSite:"lax",
                secure:false,
                httpOnly:true
            })
            
            res.status(200).json({
                status: 200,
                message: "User logged in",
                user: userData,
                token: token
            })
        } catch (error) {
            console.log(error);
            res.json(error)
        }
}
export const logout = async (req,res) => {
        try {
            res.clearCookie("currentUser")
            res.status(200).json({ message: "Logged out" })
        } catch (error) {
            console.log(error);
            res.json(error)
        }
    }
export const search = async (req,res) => {
        try {
            const searching = req.query.user
            const user = await usermanager.searchUser(searching)
            if (user == null){
                return res.status(400).json("User not found")
            }
            return res.status(200).json(user)
        } catch (error) {
            console.log(error);
        }
    }
export const searchUsers = async (req,res) => {
        try {
            const searching = req.query.user
            const users = await usermanager.searchUsers(searching)
            if (!users || users.length == 0){
                return res.status(200).json([])
            }
            return res.status(200).json(users)
        } catch (error) {
            console.log(error);
        }
    }
export const getCurrentUser = async (req, res) => {
    try {
        const token = req.cookies.currentUser
        if (!token) {
            return res.status(401).json({ error: "No session" })
        }
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY_JWT)
        const user = await usermanager.getById(decoded.sub)
        if (!user) {
            return res.status(401).json({ error: "User not found" })
        }
        let groupsarray = []
        if (user.groups && user.groups.length > 0) {
            const groupIds = user.groups
                .map(g => {
                    if (g.group && typeof g.group === 'object' && g.group._id) {
                        return g.group._id.toString()
                    }
                    if (g.group && typeof g.group === 'object') {
                        return g.group.toString()
                    }
                    return g.group ? g.group : g
                })
                .filter(id => id && id.length == 24)
            if (groupIds.length > 0) {
                groupsarray = await groupManager.getGroupsById(groupIds)
            }
        }
        const privateChats = await privateChatManager.getChatsByUserId(user._id.toString())
        const newToken = generateToken(
            user.fullname,
            user.username,
            user.email,
            user.photo,
            user._id,
            groupsarray,
            privateChats
        )
        res.status(200).json({
            user: {
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                photo: user.photo,
                id: user._id,
                groups: groupsarray,
                privateChats: privateChats
            },
            token: newToken
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({ error: "Invalid session" })
    }
}

export const getGroups = async(req,res) => {
        try {
            if (req.user && req.user.sub){
                const user = await usermanager.getById(req.user.sub)
                res.json(user)
            } else {
                res.status(401).json({ error: "Unauthorized" })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message })
        }
    }