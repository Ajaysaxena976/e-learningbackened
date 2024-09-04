import {Router} from "express";
import { checkout, fetchLecture, fetchLectures, getAllCourses, getMyCourses, getSingleCourse, paymentVerification } from "../controllers/courseController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router=Router();

router.get("/course/all",getAllCourses);
router.get("/course/:id",getSingleCourse);
router.get("/lectures/:id",isAuthenticated,fetchLectures);
router.get("/lecture/:id",isAuthenticated,fetchLecture);
router.get("/myCourses",isAuthenticated,getMyCourses);
router.post("/course/checkout/:id",isAuthenticated,checkout);
router.post("/verification/:id",isAuthenticated,paymentVerification);
export default router;