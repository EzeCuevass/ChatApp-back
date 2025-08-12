import passport from "passport";
import local from "passport-local";
import { createHash, comparePassword } from "../utils.js";
import { userModel } from "../dao/models/usersmodel.js";
import UsersDao from "../dao/users.dao.js";;
import JwtStrategy from 'passport-jwt/lib/strategy.js';
import { ExtractJwt } from "passport-jwt"
const userManager = new UsersDao();



const LocalStrategy = local.Strategy;
const initializePassport = () => {
    // Local Strategy, Register
    passport.use(
        "register",
        new LocalStrategy(
        {
            passReqToCallback: true,
        },
        async (req, username, password, done) => {
        try {
            let datos = {
                fullname: req.body.fullname.trim(),
                username: req.body.username.trim(),
                email: req.body.email.trim(),
                password: createHash(req.body.password),
                photo: req.body.photo.trim(),
            };
            const usuarioregistrado = await userManager.registerUser(datos)
            return done(null, usuarioregistrado);
            } catch (error) {
            done(error);
            }
        }
        )
    )
    // Local Strategy, Login
    passport.use('login',
        new LocalStrategy({
            passReqToCallback:true
        },
    async (req,username,password,done)=>{
        try {
            const {username,password} = req.body
            const logedUser = await userManager.logUser(username.trim())
            if (!logedUser){
                return done(null,false)
            }
            if (!comparePassword(password, logedUser.password)){
                return done(null, false)
            }
            if (username == logedUser.username && comparePassword(password, logedUser.password)){
                req.session.user = {
                    username: logedUser.username,
                    fullname: logedUser.fullname,
                    email: logedUser.email,
                    photo: logedUser.photo,
                    groups: logedUser.groups
                }
                return done(null,logedUser)
            }
            return done(null,logedUser)
        } catch (error) {
            console.log(error);
            done(error)
        }
    })
    )
    // Extracts the token from the cookies, and 
    passport.use('jwt',
        new JwtStrategy({
            jwtFromRequest:ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: process.env.PRIVATE_KEY_JWT,
        },
    async(payload, done)=>{
        try {
            return done(null, payload)
        } catch (error) {
            return done(error, false, {message: "Error validating JWT Token "})
        }
    })
    )

    function cookieExtractor(req) {
        let token = null
        if (req && req.cookies) {
            token = req.cookies["token"]
        }
        return token
    }
    passport.serializeUser((user,done)=>{
        done(null, user._id);
    });
    passport.deserializeUser(async(id,done)=>{
        try {
            const user = await userModel.findById(id)
            done(null, user)
        } catch (error) {
            done(error)
        }
    })
};

export default initializePassport;
