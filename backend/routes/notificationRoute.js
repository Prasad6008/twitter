import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { deleteAllNotifications, getAllNotifications } from '../controllers/notificationController.js'

const router = express.Router()


router
    .get('/',protectRoute,getAllNotifications)
    .delete('/',protectRoute,deleteAllNotifications)


export default router
