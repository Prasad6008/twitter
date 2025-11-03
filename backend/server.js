// const express = require('express')
import express from 'express'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import connectDB from './db/connectionDB.js'
import cookieParser from 'cookie-parser'
import userRoute from './routes/userRoute.js'
import {v2 as cloudinary} from 'cloudinary'
import postRoute from './routes/postRoute.js'
import notificationRoute from './routes/notificationRoute.js'
import cors from 'cors'
import path from "path"

dotenv.config()
cloudinary.config(
    {
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_API_SECRET_KEY
    }
)
const app = express()
const __dirname = path.resolve()
const PORT = process.env.PORT

app.use(express.json(
    {
        limit : "5mb"
    }
))
app.use(cookieParser())
app.use(cors(
    {
        origin :  "http://localhost:3000",
        credentials : true
    }
))
app.use(express.urlencoded({extended:true}))


app.use("/api/auth",authRoute)
app.use("/api/user",userRoute)
app.use("/api/posts",postRoute)
app.use("/api/notifications",notificationRoute)

if(process.env.NODE_ENV === "production")
{
    app.use(express.static(path.join(__dirname,'/frontend/build')))
    app.get("*",(req,res) =>
    {
        res.sendFile(path.resolve(__dirname,"frontend","build","index.html"))
    })
}

app.listen( PORT , ()=>
{
    console.log(`Server is running on ${PORT}`)
    connectDB()
})
