import {Router} from "express";
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllStats, getAllUsers, updateRole } from "../controllers/adminController.js";
import { uploadFiles } from "../middleware/multer.js";

const router=Router();

router.post("/course/new",isAuthenticated,isAdmin,uploadFiles,createCourse);
router.post("/course/:id",isAuthenticated,isAdmin,uploadFiles,addLecture);
router.delete("/course/:id",isAuthenticated,isAdmin,deleteCourse);
router.delete("/lecture/:id",isAuthenticated,isAdmin,deleteLecture);
router.get("/stats",isAuthenticated,isAdmin,getAllStats);
router.put("/user/:id",isAuthenticated,isAdmin,updateRole);
router.get("/users",isAuthenticated,isAdmin,getAllUsers);
export default router;