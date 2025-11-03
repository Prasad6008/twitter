import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { followUnfollow, getProfile ,getSuggestedUsers,updateProfile} from '../controllers/userController.js'

const router = express.Router()

router
    .get('/profile/:userName',protectRoute,getProfile)
    .post('/follow/:id',protectRoute,followUnfollow)
    .get('/suggestions',protectRoute,getSuggestedUsers)
    .post('/update',protectRoute,updateProfile)

export default router