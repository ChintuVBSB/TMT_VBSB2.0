import express from 'express'

import {
  adminLogin,
  getProfile,
  login,
  managerLogin,
  teamLogin,
  verifyOTP,
} from "../controllers/authController.js";
import { verifyToken } from '../middlewares/authMiddleware.js';
import multer from "multer";
import { updateProfile } from '../controllers/userController.js';


const router = express.Router()

router.post("/login", login); 
router.post('/verify-otp', verifyOTP)
router.post("/admin/login", adminLogin);
router.post("/manager/login", managerLogin);
router.post("/team/login", teamLogin);
router.get("/profile", verifyToken, getProfile);
const upload = multer({ dest: "uploads/" });

router.patch("/update-profile", verifyToken, upload.single("photo"), updateProfile);



export default router