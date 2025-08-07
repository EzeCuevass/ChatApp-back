import { Router } from "express";
import MessageDao from "../dao/message.dao.js";
import * as messageController from "../controllers/messagecontrollers.js";

const router = Router()
const manager = new MessageDao
// General Chat
router.get('/', messageController.home)
// Post message
router.post('/', messageController.postMessage)
// Get Last Message
router.get('/getLastMessage', messageController.getLastMessage)

export default router