import userModel from  '../models/userModel.js'
import bcrypt from 'bcryptjs' 
import generateToken from '../utils/genearteToken.js'

export const signUp = async(req,res) =>
{
    try{
        const {userName,fullName,email,password} = req.body
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if(!emailRegex.test(email)){    //.test(string) → returns true or false if the string matches the regex.
            return res.status(400).json({error:'Invalid Email format'})
        }

        const existingUser = await userModel.findOne({email})  //or check with email
        const existingUserName = await userModel.findOne({userName})

        //If already loggined
        if(existingUser || existingUserName)
        {
            return res.status(400).json({error:"Already account exists"})
        }

        if(password.length < 6){
            return res.status(400).json({error:"Password must be 6"})
        }

        //Hashing the password
        //1234567 = fdfjdlskfjkmxbdcvdwuch5849hg

        const salt = await bcrypt.genSalt(10)  //Declaration
        const hashedPassword  = await bcrypt.hash(password,salt)   // password ah => salt paniru


        const newUser = new userModel( 
            {
                userName,
                fullName,
                email,
                password : hashedPassword
            }
        )

        if(newUser){
            //Before we should create a js web token for cookies
            generateToken(newUser._id,res)
            await newUser.save()  //save to mongoDB 
            res.status(200).json({
                _id : newUser._id,
                userName : newUser.userName,
                fullName : newUser.fullName,
                email : newUser.email,
                followers : newUser.followers,
                following : newUser.following,
                profileImg : newUser.profileImg,
                coverImg : newUser.coverImg,
                bio : newUser.bio,
                links : newUser.links
            })
        }
        else{
            res.status(404).json({error:"Invalid User Data"})
        }
    }catch(err){
        console.log('Error in signUp',err.message)
        res.status(500).json({error:'Internal server Erorr'})
    }
}

export const login = async(req,res) =>
{
    try{
        const {userName,password} = req.body

        // const existingUser_my_Mail = await userModel.findOne({email})

        const existingUser_my_userName = await userModel.findOne({userName})

        // if(!existingUser_my_Mail){
        //     return res.status(404).json({error:"User doesn't exists"})
        // }

        if(!existingUser_my_userName){
            return res.status(404).json({error:"User doesn't exists"})
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser_my_userName.password || "") //returns true or false

        // res.json({bc:isPasswordCorrect})

        if(existingUser_my_userName.userName === userName && isPasswordCorrect){
            generateToken(existingUser_my_userName._id,res)
            return res.status(200).json({Success:"Loggined"})
            // res.json({existingUser_my_Mail,email:existingUser_my_Mail.email})
        }else
        {
            return res.status(404).json({error:"Invalid email or password"})
        }


    }catch(err){
        console.log('Error in login',err.message)
        return res.status(500).json({error:'Internal server Erorr from login'})
    };
}

export const logout = async(req,res) =>
{
    try{       // cookie_name , token , {parameters}
        res.cookie("jwt"      ,  ""    , {maxAge:0} )//Idhu token kedayaathi , cerate aaitu del aaidum
        res.status(200).json({Message:"Logout successful"})
    }catch(err){
        console.log('Error in logout',err.message)
        res.status(500).json({error:'Internal server Erorr from logout'})
    }
}


export const getMe = async(req,res)=>
{
    try{
        const user = await userModel.findOne({_id : req.user._id}).select("-password")
        res.status(200).json(user)

        if(!user){
            res.status(404).json({error:"Can't get user profile"})
        }
    }catch(err){
        console.log('Error in getMe',err.message)
        res.status(500).json({error:'Internal server Erorr from getME'})
    }
}