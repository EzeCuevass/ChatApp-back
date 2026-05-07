import path from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default __dirname
// bcrypt
export function createHash(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
}

export function comparePassword(password, hashedPassword){
    return bcrypt.compareSync(password, hashedPassword)
}

// JWT
export const generateToken = (fullname,username,email,photo,id,groups) =>{
    const payload = {
        full_name: fullname,
        username: username,
        email: email,
        photo: photo,
        sub:id,
        groups: groups
    }
    return jwt.sign(
        payload, 
        process.env.PRIVATE_KEY_JWT,
        {
            expiresIn: "1h"
        }
    )
}
export const authToken = (req, res, next) => {
    const token = req.headers.currentUser || req.headers['currentUser'] || req.cookies.currentUser || req.headers.currentuser || req.cookies.currentuser || req.headers['currentuser'];
    if(!token) {
        return res.redirect('/')
    }
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY_JWT)
        req.user = decoded
        console.log("[utils.js] [authToken] User authenticated successfully");
        
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
}
export function groupFunctions() {
    return async (req, res, next) => {
        const idgroup = (req.params.id || req.query.id || req.body.idgroup || "").toString()
        
        if (!req.session.user && !req.user){
            return res.redirect('/')
        }
        
        if (req.user.groups) {
            const hasGroup = req.user.groups.some(g => g._id.toString() === idgroup)
            if (!hasGroup){
                return res.redirect('/')
            }
        }
          
        next();
    };
}