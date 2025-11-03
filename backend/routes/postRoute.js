import express from 'express'
import protectRoute from '../middlewares/protectRoute.js'
import { commentPost, createPost,deletePost,getFollowingPosts,getUserPosts,likedPosts,likeUnLikePost,viewPosts} from '../controllers/postController.js'

const router = express.Router()

router
    .get('/',protectRoute,viewPosts)
    .get('/followingposts',protectRoute,getFollowingPosts)
    .get('/userposts/:userName',protectRoute,getUserPosts)
    .post('/create',protectRoute,createPost)
    .post('/like/:id',protectRoute,likeUnLikePost)
    .get('/likedposts/:id',protectRoute,likedPosts)
    .post('/comment/:id',protectRoute,commentPost)
    .delete('/:postId',protectRoute,deletePost)

export default router