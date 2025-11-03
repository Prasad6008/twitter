import express from 'express'
import {signUp,login,logout,getMe} from '../controllers/authController.js'
import protectRoute from '../middlewares/protectRoute.js'

const router = express.Router()

router
    .post('/signup',signUp)
    .post('/login',login)
    .post('/logout',logout)
    .get('/me',protectRoute,getMe)



export default router