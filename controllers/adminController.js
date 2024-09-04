import { catchAsyncError } from "../middleware/catchAsyncError.js";
import {Course} from "../models/courseModel.js"
import { Lecture } from "../models/lectureModel.js";
import { User } from "../models/usermodel.js";
import {rm} from "fs";
import fs from "fs";
import { promisify } from "util";

export const createCourse=catchAsyncError(async(req,res,next)=>{
    const {title,description,category,createdBy,duration,price}=req.body;
    const image=req.file;
    await Course.create({
        title,
        description,
        price,
        image:image?.path,
        duration,
        category,
        createdBy
    })
    res.status(200).json({
        message:"Course created successfully"
    })
});
export const addLecture=catchAsyncError(async(req,res,next)=>{
    let {id}=req.params;
    let course=await Course.findOne({_id:id});
    let {title,description}=req.body;
    if(!course){
        return res.status(400).json({
            message:"Course does not exist in database",
        })
    }
    let file=req.file;
    // console.log("Request reached here");
    let lecture=await Lecture.create({
        title,
        description,
        video:file?.path,  //if req.files exist then give it path
        course:course._id,
    });
    res.status(200).json({
        message:"Video Uploaded successfully",
        lecture
    })
});


export const deleteLecture=catchAsyncError(async(req,res,next)=>{
    const lecture=await Lecture.findOne({_id:req.params.id});
    //deletion is not much simple as you thing
    //1 delete the lecture from database
    //2 delete it from the uploads where it is stored by multer
    //Here we need to use the concepts of fileHandling in nodejs
    //For deleting the rm is used which is imported from "fs"
    rm(lecture.video,()=>{
        console.log("Video deleted");
    })
    await lecture.deleteOne();
    res.status(200).json({
        message:"Lecture deleted successfully"
    })
})
const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = catchAsyncError(async (req, res) => {
  const course = await Course.findById(req.params.id);

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats=catchAsyncError((async(req,res,next)=>{
    const totalLectures=(await Lecture.find()).length;
    const totalCourses=(await Course.find()).length;
    const totalUsers=(await User.find()).length;
    
    const stats={
        totalCourses,
        totalLectures,
        totalUsers
    }
    res.status(200).json({
        stats,
    })
}))

export const getAllUsers=catchAsyncError(async(req,res,next)=>{
    //finding all the users except the current login user
    // const users=await User.find({_id:{$ne:req.user._id}}.select("-password"));
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
        "-password"
      );
    res.json({users});
});

export const updateRole=catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.params.id);
    
    if(user.role==="user"){
        user.role="admin";
        await user.save();
        return res.status(200).json({
            message:"Role updated to the admin",
        });
    }
    
    if(user.role==="admin"){
        user.role="user";
        await user.save();
        return res.status(200).json({
            message:"Role updated to the user",
        });
    }

})