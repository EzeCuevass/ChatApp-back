import { Router } from "express";
import { authToken, groupFunctions } from "../utils.js";
import * as groupController from "../controllers/groupcontrollers.js";
const router = Router()

// Create Group
router.post('/createGroup', 
    groupController.createGroup
)
// Add Members to Group
router.put('/addMembers', 
    authToken,
    groupFunctions(),
    groupController.addMembers
    )
// Post Message in Group
router.put('/postMessageInGroup',
    authToken,
    groupFunctions(),
    groupController.postMessageInGroup)
// Ver el grupo
router.get('/:id', 
    authToken,
    groupFunctions(),
    groupController.getGroupById)
// Get Last Message in Group
router.get('/getLastMessageInGroup', 
    authToken,
    groupFunctions(),
    groupController.getLastMessageInGroup
)
router.delete('/:id',
    authToken,
    groupFunctions(),
    groupController.deleteGroup
)
export default router