import { Router } from 'express';
import { authToken } from '../utils.js';
import * as ctrl from '../controllers/privatechatcontrollers.js';

const router = Router();

// Get or create private chat with another user
router.post('/:userId',
    authToken,
    ctrl.getPrivateChat
);

// Add message to an existing private chat
router.put('/:chatId/message',
    authToken,
    ctrl.addMessageToPrivateChat
);

// List all private chats for the authenticated user
router.get('/',
    authToken,
    ctrl.getMyPrivateChats
);

export default router;
