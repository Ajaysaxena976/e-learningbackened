import express from "express";
import dotenv from "dotenv";
import { dbConnection } from "./database/dbConnection.js";
import userRoute from "./routes/userRoutes.js"
import courseRoute from "./routes/courseRouter.js";
import adminRouter from "./routes/adminRouter.js";
import Razoray from  "razorpay"
import cors from "cors"
dotenv.config();

const app=express();
app.use(cors())

export const instance=new Razoray({
    key_id:process.env.KEY_ID,
    key_secret:process.env.KEY_SECRET,
})

app.use("/uploads",express.static("uploads"));
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("SErver is working");
})

dbConnection();
app.use("/api",userRoute);
app.use("/api",courseRoute);
app.use("/api",adminRouter);
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on the port ${process.env.PORT}`);
})