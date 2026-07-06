import { Router } from "express";
import passport from "passport";
import * as userController from "../controllers/usercontrollers.js";


const router = Router() 

// Register
router.post("/register", (req, res, next) => {
    passport.authenticate('register', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "User already exists" });
        req.user = user;
        next();
    })(req, res, next);
}, userController.register)
// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "User or password incorrect" });
        req.user = user;
        next();
    })(req, res, next);
}, userController.login)
// Log out
router.get('/logout',
    userController.logout
)
// Upload photo
router.post('/upload-photo',
    userController.uploadPhoto
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
// Get current user from cookie (session restore)
router.get('/current',
    userController.getCurrentUser
)
export default router