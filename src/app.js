import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())
app.get('/',(req,res)=>{
    res.send("fuck you ")
})
app.get('/health',(req,res)=>{
    res.send('health check')
})
//router import
import userRouter from "./routes/user.routers.js"


//routers declaration
app.use("/api/v1/users",userRouter)



export { app }