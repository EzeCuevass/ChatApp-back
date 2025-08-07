import { Router } from 'express';
import { authToken } from '../utils.js';
import * as privateChatController from '../controllers/privatechatcontrollers.js';
const router = Router();

// Get Private Chat
router.post('/:userId', 
    authToken, 
    privateChatController.getPrivateChat
    );
router.post('/addMessageToPrivateChat/:id', 
    authToken, 
    privateChatController.addMessageToPrivateChat
    );
export default router;