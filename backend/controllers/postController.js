import notificationModel from "../models/notificationModel.js"
import postModel from "../models/postModel.js"
import userModel from "../models/userModel.js"
import { v2 as cloudinary } from 'cloudinary';


export const viewPosts = async(req,res) =>
{
    try {
                                           // -1 refers bottom to top
        const allPosts = await postModel.find().sort({createdAt:-1})
        .populate(
            {
                path : "postOwner",
                select :["-password","-email"]
            }
        ).populate(
            {
                path : "comments.commentedOwner",
                select : ["-password","-email"]
            }
        )

        if(allPosts.length === 0){
            return res.status(404).json({Error:"No such a post is available"})
        }

        return res.status(200).json(allPosts)
    } catch (error) {
        console.log({Error:error.message})
        res.status(500).json({Error:"Internal server error in view posts"})
    }
}

export const createPost  = async(req,res) =>
{
    try {
        let {text,img} = req.body
        
        const currentUser = await userModel.findById(req.user._id)

        if(!currentUser){
            return res.status(400).json({error:"User not found"})
        }

        if ((!text || text.trim().length === 0) || (!img || img.trim().length === 0)) {
         return res.status(400).json({ error: "You must write something and add an image!" });
        }


        if(img){
            const uploadResponse = await cloudinary.uploader.upload(img)
            img = uploadResponse.secure_url
            console.log("UploadedIMG",img)
        }

        const newPost = new postModel(
            {
                postOwner : currentUser._id,
                text,
                img
            }
        )

        await newPost.save()

        res.status(201).json(newPost)  //201 for creation
    } catch (error) {
        console.log({Error:error.message})
        res.status(500).json({Error:"Internal server error in createPost"})
    }
} 

export const deletePost = async(req,res)=>
{
    try {

        const {postId} = req.params

        const post = await postModel.findById(postId)

        if(!post){
            return res.status(404).json({Error:"No such a post is available"})
        }


        if(post.postOwner.toString() !== req.user._id.toString()){
            return res.status(401).json({Error:"You can't delete this post:Unauthorized"}) //Auth || unAuth = 401
        }

        if(post.img){
            const imgId = post.img.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(imgId);
        }

        await postModel.findByIdAndDelete(postId)

        return res.status(200).json({Success:"Post Deleted !"})

    } catch (error) {
        console.log({Error_in_deletePost:error.message})
        res.status(500).json({Error:"Internal server error in deletePost"})
    }
}

export const commentPost = async(req,res)=>
{
    try {

        const postId = req.params.id 
        const post   = await postModel.findById(postId)

        if(!post){
            return res.status(404).json({Error:"No such a post is available"})
        }

        const currentUser = await userModel.findById(req.user._id)

        const {comment} = req.body

        if(!comment){
            return res.status(404).json({Error:"Comment box cannot be empty"})
        }

        const newComment = 
        {
            commentedOwner : currentUser._id,
            comment
        }

        post.comments.push(newComment)

        await post.save()

        const newNotification = new notificationModel(
            {
                from : req.user._id ,
                to   : post.postOwner,
                type : 'comment'
            }
        )

        await newNotification.save()

        return res.status(200).json({Success:"Commented successfully !"})

    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in commenting post"})
    }
}


export const likeUnLikePost = async(req,res)=>
{
    try {
        const currentUserId = req.user._id 

        const postId = req.params.id  

        const post  = await postModel.findById(postId)

        if(!post){
            return res.status(404).json({Error:"No such a post is available"})
        }

        const userLikeOrUnLike = post.likes.includes(currentUserId)

        if(!userLikeOrUnLike){

            //To like
            post.likes.push(currentUserId)
            await post.save()

            await userModel.findByIdAndUpdate({_id : currentUserId} , {$push : {likedPosts : postId}})


            const newNotification = new notificationModel(
                {
                    from : currentUserId,
                    to   : post.postOwner._id,
                    type : "like"
                }
            )
            await newNotification.save()

           

            const updatedLikes = post.likes 

            return res.status(200).json(updatedLikes)

        }else 
        {
            //To unlike
            post.likes.pull(currentUserId)
            await post.save()
            
            await userModel.findByIdAndUpdate({_id : currentUserId} , {$pull : {likedPosts : postId}})

            const notification = new notificationModel(
                {
                    from : currentUserId ,
                    to : post.postOwner ,
                    type : 'like'
                }
            )

            await notification.save()

            const updatedLikes = post.likes.filter( id => id.toString() !== currentUserId.toString())

            // return res.status(200).json("Disliked")
            return res.status(200).json(updatedLikes)
        }
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in likeUnlike post"})
    }
}


export const likedPosts = async(req,res) =>
{
    try {
        const currentUserId = req.user._id
        const currentUser = await userModel.findById(currentUserId)

        if(!currentUser)
        {
            return res.status(400).json({Error:"User not found"})
        }

        const likedPosts = await postModel.find({_id : {$in : currentUser.likedPosts}}).populate(
            {
                path : "postOwner",
                select :["-password","-email"]
            }
        )

        return res.status(200).json(likedPosts)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in likedPosts post"})
    }
}

export const getFollowingPosts = async(req,res)=>
{
    try {
        const currentUserId = req.user._id 
        const currentUser = await userModel.findById(currentUserId)

        if(!currentUser){
            return res.status(404).json({Error:"User not found"})
        }

        const following = currentUser.following


        const feedPosts = await postModel.find( {postOwner : {$in : following}}).sort({createAt:-1})
        .populate(
            {
                path : "postOwner",
                select :["-password","-email"]
            }
        ).populate(
            {
                path : "comments.commentedOwner",
                select : ["-password","-email"]
            }
        )
        
        return res.status(200).json(feedPosts)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in getFollowing posts post"})
    }
}


export const getUserPosts = async(req,res)=>
{
    try {

        const {userName} = req.params 

        const user = await userModel.findOne({userName})

        if(!user){
            return res.status(404).json({Error:"User not found"})
        }

        const feedPosts = await postModel.find({postOwner : user._id})
        .populate(
            {
                path : "postOwner",
                select : ["-password","-email"]
            }
        )

        return res.status(200).json(feedPosts)


    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in getFollowing posts post"})
    }
}


