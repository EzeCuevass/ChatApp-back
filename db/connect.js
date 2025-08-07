import mongoose from "mongoose"
import 'dotenv/config'

const MONGO = process.env.MONGO_URI

export const initDB = () => {
    mongoose.connect(MONGO)
    .then(()=> console.log("CONECTADO A DB"))
}

