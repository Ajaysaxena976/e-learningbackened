import express from "express";
import { login, myProfile, register, verifyUser } from "../controllers/userController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router=express.Router();

router.post("/user/register",register);
router.post("/user/verify",verifyUser);
router.post("/user/login",login);
router.get("/user/me",isAuthenticated,myProfile);
export default router;