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
    const token = req.cookies.currentUser || req.headers.currentUser || req.headers['currentUser'] || req.cookies.currentuser || req.headers.currentuser || req.headers['currentuser'];
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
        const idgroup = req.query.id ? req.query.id : req.body.idgroup
        console.log(req.query);
        
        let groupsarray = []
       
        if (req.session.user || req.user){
            
            if (req.user.groups) {                
                for (const group of req.user.groups){
                    groupsarray.push(group._id)
                }
            }
            if (!groupsarray.includes(idgroup)){ 
                console.log("[utils.js] [groupFunctions] User is not in group");
                
                return res.redirect('/')
            }
        } else {
            console.log("[utils.js] [groupFunctions] No user session found");
            
            return res.redirect('/')
        }
        console.log("[utils.js] [groupFunctions] User is in group");
          
        next();
    };
}