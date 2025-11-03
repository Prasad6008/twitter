import notificationModel from "../models/notificationModel.js"
import userModel from "../models/userModel.js"
import bcrypt from "bcryptjs"
import cloudinary from 'cloudinary'

export const getProfile = async(req,res)=>
{
    try{
        const {userName} = req.params
        const user = await userModel.findOne({userName}).select("-password")

        if(!userName){
            return res.status(400).json({Error:"User not found"})
        }

        res.status(200).json(user)
    }catch(err){
        console.log({"Error":err.message})
        res.status(500).json({Error:"Internal sever error from getProfile"})
    }
}


export const followUnfollow = async(req,res)=>
{
    try {
        const {id} = req.params


        const userToModify = await userModel.findById({_id:id})

        const currentUser = await userModel.findById({_id:req.user._id})

        if(id === req.user._id){
            return res.status(400).json({Error:"You can't unfollow/follow yourself"})
        }

        if(!userToModify || !currentUser){
            res.status(400).json({Error:"User not found"})
        }

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing){
            //unfollow
            await userModel.findByIdAndUpdate({_id:id},{$pull:{followers:req.user._id}})
            await userModel.findByIdAndUpdate({_id:req.user._id},{$pull:{following:id}})

            res.status(200).json(`You are UnFollowed "${userToModify.userName}"`)
        }else{
            //Follow
            await userModel.findByIdAndUpdate({_id:id},{$push:{followers:req.user._id}})
            await userModel.findByIdAndUpdate({_id:req.user._id},{$push:{following:id}})


            //Send Notification
            const newNotification = new notificationModel(
                {
                    from : req.user._id,
                    to   : id,
                    type :"follow",
                    //read : theva ila becoz def value = true
                }
            )

            await newNotification.save()

            res.status(200).json(`You are following "${userToModify.userName}"`)
        }
        
    } catch (error) {
        console.log({"Error":err.message})
        res.status(500).json({Error:"Internal sever error from followUnfollow"})
    }
}

export const getSuggestedUsers = async(req,res)=>
{
    try {

        const currentUserId = req.user._id 

        //Currecnt user oda doc
        const currentUser = await userModel.findById(currentUserId)

        //Current user ah thavara meethi oru 3 data
        const users = await userModel.aggregate(
            [
                {
                    $match:
                    {
                        _id : { $ne : currentUserId}
                    }
                },
                {
                    $sample:
                    {
                        size: 10
                    }
                }
            ]
        )

        //Current user follow pandravangala thavara meethi irukura data
        const filteredUsers = users.filter(u => !currentUser.following.includes(u._id))

        const suggestedUsers = filteredUsers.slice(0,3)

        suggestedUsers.forEach( u => u.password = null)

        res.status(200).json(suggestedUsers)
        
    } catch (error) {
        console.log({"Error":error.message})
        res.status(500).json({Error:"Internal sever error from getSuggestions"})
    }
}


export const updateProfile = async(req,res) =>
{
    try {
        const currentUserId = req.user._id 

        let currentUser = await userModel.findById(currentUserId)

        let {userName,fullName,currentPassword,newPassword,bio,links} = req.body 

        let {profileImg,coverImg} = req.body

        if(!currentUser){
            return res.status(400).json({Error:"User not found"})
        }

        if(!currentPassword && newPassword || currentPassword && !newPassword){
            return res.status(400).json({Error:"Please provide both of the fields"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword,currentUser.password)
            if(!isMatch){
                return res.status(400).json({Error:"Current Password is incorrect"})
            }

            if(newPassword.length < 6){
                return res.status(400).json({Error:"Password must be 6"})
            }

            const salt = await bcrypt.genSalt(10)
            currentUser.password = await bcrypt.hash(newPassword,salt)
        }

        if(profileImg){
                if(userModel.profileImg){
                    await cloudinary.uploader.destroy(userModel.profileImg.split('/').pop().split('.')[0])
                }
                const uploadedResponse = await cloudinary.uploader.upload(profileImg)
                profileImg = uploadedResponse.secure_url 
            }
            
            if(coverImg){

                if(userModel.coverImg){
                    await cloudinary.uploader.destroy(userModel.coverImg.split('/').pop().split('.')[0])
                }
                const uploadedResponse = await cloudinary.uploader.upload(coverImg)
                coverImg = uploadedResponse.secure_url 
            }

        currentUser.userName = userName || currentUser.userName
        currentUser.fullName = fullName || currentUser.fullName
        currentUser.bio      = bio      || currentUser.bio 
        currentUser.links    = links     || currentUser.links

        currentUser.profileImg = profileImg || currentUser.profileImg
        currentUser.coverImg   = coverImg   || currentUser.coverImg

        await currentUser.save()

        return res.status(200).json(currentUser)

    } catch (error) {
        console.log({"Error":error.message})
        res.status(500).json({Error:"Internal sever error from updateProfile"})
    }
}