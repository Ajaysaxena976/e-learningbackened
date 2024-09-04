import { instance } from "../index.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Course } from "../models/courseModel.js";
import { Lecture } from "../models/lectureModel.js";
import { User } from "../models/usermodel.js";
import { Payment } from "../models/paymentModel.js";
import {rm} from "fs"
import crypto from "crypto"
export const getAllCourses=catchAsyncError(async(req,res,next)=>{
    let courses=await Course.find({});
    res.status(200).json({
        courses
    })
})
export const getSingleCourse=catchAsyncError(async(req,res,next)=>{
    let {id}=req.params;
    let course=await Course.findOne({_id:id});
    if(!course){
        return res.status(400).json({
            message:"Course does not exist",
        })
    }
    res.status(200).json({
        course,
    })
});
export const fetchLectures=catchAsyncError(async(req,res,next)=>{
    //fetching lecture of a particular course 
    const lectures=await Lecture.find({course:req.params.id});
    //approach is 1 If user is admin , he can get any lectures
    //2 But if it is not the admin, then first fetch the user 
    // and check it has subscription of this course or not.
    const user=await User.findOne({_id:req.user._id});
    if(user.role==="admin"){
        return res.status(200).json({
            lectures
        })
    }
    if(!user.subscription.includes(req.params.id)){
        return res.status(400).json({
            message:"You don't have subscription or Course might be deleted",
        })
    }
    else{
     return res.status(200).json({
        lectures
    })
  }
});
export const fetchLecture=catchAsyncError(async(req,res,next)=>{
    const lecture=await Lecture.findOne({_id:req.params.id});
    const user=await User.findOne({_id:req.user._id});
    if(user.role==="admin"){
        return res.status(200).json({
            lecture
        })
    }
    if(!user.subscription.includes(lecture.course)){
       return  res.status(400).json({
            message:"You don't have subscription",
        })
    }
    else
    {
      return res.status(200).json({
        lecture
    })
    }
});
//api for the user to get his purchased courses
export const getMyCourses=catchAsyncError(async(req,res,next)=>{
    const courses=await Course.find({_id:req.user.subscription}); 

    res.status(200).json({
        courses
    })
});
export const checkout = catchAsyncError(async (req, res) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }

  const options = {
    amount: Number(course.price * 100),
    currency: "INR",
  };

  const order = await instance.orders.create(options);
  console.log("order in checkout handler is",order);

  res.status(201).json({
    order,
    course,
  });
});

const verifyPayment = (order_id, razorpay_payment_id, razorpay_signature) => {
  const secret = process.env.KEY_SECRET; // Your Razorpay Key Secret
  const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${order_id}|${razorpay_payment_id}`)
      .digest('hex');


  return generated_signature === razorpay_signature;
};

export const paymentVerification = catchAsyncError(async (req, res) => {
  console.log(req.body);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

    const isPaymentValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  console.log(isPaymentValid);
  if (isPaymentValid) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    console.log("After payment save");
    const user = await User.findById(req.user._id);
    console.log(user);
    const course = await Course.findById(req.params.id);
    console.log("Course is :",course);
    console.log("Pushing in subscription")
    user.subscription.push(course._id);
    console.log("pushed in subscription");
    
    
    await user.save();
    console.log("User is saved and response is now sent");
    res.status(200).json({
      message: "Course Purchased Successfully",
    });
  } else {
    return res.status(400).json({
      message: "Payment Failed",
    });
  }
});