import jwt from "jsonwebtoken";
import { User } from "../models/usermodel.js";

export const isAuthenticated=async(req,res,next)=>{
    try{
        const {token}=req.headers;
        if(!token){
            res.status(403).status({
                message:"Kindly login first",
            })
        }
        const decodedToken=await jwt.verify(token,process.env.JWT_LOGIN_SECRET);
        req.user=await User.findOne({_id:decodedToken._id});
        next();
    }
    catch(error){
        console.log(error);
        res.status(400).json({
            message:"Kindly login first",
        })
    }
}
export const isAdmin=async(req,res,next)=>{
    try{
        if(req.user.role!=="admin"){
            return res.status(403).json({
                message:"YOu are not the admin",
            })
        }
        // console.log("Request released from here")
        next();
    }catch(error){
        res.status(400).json({
            message:error.message
        })
    }
}