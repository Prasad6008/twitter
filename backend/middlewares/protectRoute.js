import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

const protectRoute = async(req,res,next) =>
{
    try{
        const token =  req.cookies.jwt
        if(!token){
            return res.status(400).json({error:"Unauthorized: No token Provided"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(400).json({error:"Unauthorized: Can't token Decoded"})
        }

        const user = await userModel.findOne({_id:decoded.userID}).select("-password")

        if(!user){
            return res.status(404).json({error:"User not found"})
        }

        req.user = user;
        next()
    }catch(err){
        console.log("error in protectRoute",err.message)
        return res.status(500).json({error:`Internal Server error ProtectRote ${err.message}`})
    }
}

export default protectRoute