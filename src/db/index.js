import mongooes from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongooes.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n connect fucking database: ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("mongodb connection fucked up", error)
        process.exit(1)
    }
}

export default connectDB;
 