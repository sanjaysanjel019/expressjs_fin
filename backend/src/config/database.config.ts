import mongoose from "mongoose";
import { Env } from "../config/env.config";

const connectDatabase = async () => {
    try{
        await mongoose.connect(Env.MONGO_URI,{
            serverSelectionTimeoutMS:8000,
            socketTimeoutMS:60000,
            connectTimeoutMS:20000
        });
        console.log("⚡ Database connected successfully");
    }catch(error){
        console.log("⚱️ Error connecting to database: ",error);
        process.exit(1);
    }
}

export default connectDatabase;