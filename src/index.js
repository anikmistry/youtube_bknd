import connectDB from "./db/index.js";
import dotenv from "dotenv"
dotenv.config({
    path: "../.env"
})
import { app } from "./app.js";
connectDB()
.then(()=>{
    app.on("error", (error)=>{
        console.log("error come from server cunnection", error)
    })
    app.listen(process.env.PORT, ()=>{
        console.log(`the server port number is ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("there is a fuccking error from database. the error is",err)
   
})














// import mongoose from "mongoose";
// import express from "express"
// import {DB_NAME} from "./constants.js";
// console.log(DB_NAME)
// import dotenv from "dotenv"
// import connectDB from "./db/index.js";
// dotenv.config({
//     path: "../.env"
// })




// console.log(process.env.MONGODB_URI)


// const app = express()
// console.log(app);                                          
//  (async () =>{
//     try {
//         console.log()
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error)=>{
//             console.log("error",error);
//             throw error;
//         })

//         app.listen(process.env.PORT, ()=>{
//             console.log(`app is listening on posrt${process.env.PORT}`)
//         })

//     } catch (error) {
//         console.error("ERROR", error);
//         throw error
//     }
// }
//  )();