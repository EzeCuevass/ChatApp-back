import { Router } from "express";
import passport from "passport";
import * as userController from "../controllers/usercontrollers.js";


const router = Router() 

// Register
router.post("/register", 
    passport.authenticate('register', {failureMessage:"User already exists"}),
    userController.register)
// Login
router.post('/login',
    passport.authenticate('login', {failureMessage:"User or password incorrect"}),
    userController.login
)
// Log out
router.get('/logout',
    userController.logout
)
// Search User
router.get('/search',
    userController.search
)
// Search an array of users
router.get('/searchUsers',
    userController.searchUsers
)
// Get User Groups
router.get('/getgroups', 
    userController.getGroups
)
export default router