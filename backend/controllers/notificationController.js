import notificationModel from "../models/notificationModel.js"
import userModel from "../models/userModel.js"

export const getAllNotifications = async(req,res)=>
{
    try {

        const currentUser = await userModel.findById(req.user._id)

        await notificationModel.updateMany({to : currentUser._id},{read : true})

        const all_notifications_updated = await notificationModel.find({to : currentUser._id})
        .populate( 
            {
                path : "from",
                select : "userName"
            }
        )
        .populate(
            {
                path : "to",
                select : "userName"
            }
        )

        return res.status(200).json(all_notifications_updated)
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in allNotifications.js "})
    }
}

// export const deleteNotificaton = async(req,res)=>
// {
//     try {

//         const notification = await notificationModel.findById(req.params.id)

//         if(!notification){
//             return res.status(400).json({Error:"No such a notifi found"})
//         }

//         await notificationModel.findByIdAndDelete(notification)

//         return res.status(200).json("Notification Deleted...🚮")

//     } catch (error) {
//         console.log({Error:error.message})
//         return res.status(500).json({Error:"Internal server error in deleteNotificaton.js "})
//     }
// }

export const deleteAllNotifications = async(req,res) =>
{
    try {
        const currentUserId = req.user._id

        await notificationModel.deleteMany({to : currentUserId})

        return res.status(200).json({Message :"Notifications Deleted successfully"})
    } catch (error) {
        console.log({Error:error.message})
        return res.status(500).json({Error:"Internal server error in deleteAllNotifications.js"})
    }
}