import mongoose from "mongoose";

export const dbConnection=async()=>{
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("connected to db");
    })
    .catch((error)=>{
        console.log("Some error occured in connecting database",error);
    })
}