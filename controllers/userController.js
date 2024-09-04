import { User } from "../models/usermodel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import sendMail from "../middleware/sendEmail.js";
import {catchAsyncError} from "../middleware/catchAsyncError.js";
export const register=catchAsyncError(async(req,res,next)=>{
    const {email,password,name}=req.body;
        
        let user=await User.findOne({email:email});
        if(user){
            return res.status(400).json({
                message:"User alrady exist",
            })
        }
        const hashedpassword=await bcrypt.hash(password,10);
        user={
            name:name,
            email:email,
            password:hashedpassword,
        }
        //generate otp
        const otp=Math.floor(Math.random()*1000000);
        //token
        const activationToken=await jwt.sign({user,otp},process.env.JWT_SECRET,{expiresIn:"5m"})
        //data we will send to the user email
        // and made a middleware for it
        const data={name,otp};
        sendMail(
            email,
            "E Learning",
            data
        )
        res.status(200).json({
            message:"Otp send to your mail",
            activationToken
        })
})
export const verifyUser=catchAsyncError(async(req,res,next)=>{
    const {otp,activationToken}=req.body;
    const verify=jwt.verify(activationToken,process.env.JWT_SECRET);
    if(!verify){
        res.status(400).json({
            message:"Otp expired (valid upto 5 minute only)"
        })
    }
    if(verify.otp!==otp){
        res.status(400).json({
            message:"Wrong otp"
        })
    }
    await User.create({
        name:verify.user.name,
        email:verify.user.email,
        password:verify.user.password,
    })
    res.status(200).json({
        message:"User registered successfully"
    })
})

export const login=catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email:email});
    if(!user){
        return  res.status(400).json({
            message:"User with this email does not exist",
        })
    }
    const isMatched = await bcrypt.compare(password, user.password);
    if(!isMatched){
        return res.status(400).json({
            message:"Incorrect password",
        })
    }
    const token=jwt.sign({_id:user._id},process.env.JWT_LOGIN_SECRET,{expiresIn:"15d"});
    res.status(200).json({
        message:`Welcome back , ${user.name}`,
        token,
        user
    })
})
export const myProfile=catchAsyncError(async(req,res,next)=>{
    const user=await User.findOne({_id:req.user._id});
    res.status(200).json({
        user
    })
})