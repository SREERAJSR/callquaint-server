import mongoose from "mongoose";
import configKey from "./configkeys";

const MONGO_URL = configKey().MONGO_URL;


const databaseConfg = async () => {
    try {
        await mongoose.connect(MONGO_URL, { dbName: configKey().DB_NAME })
        console.log('DATABASE CONNECTED')
    } catch (error) {
        if (error) console.log('Database connection error',error);
        process.exit(1)
    } 
} 
 
export default databaseConfg 