import express from "express";


const router = express.Router();

router.post("/register",  registerUser); // admin only later

import { registerUser, getAllUsers, updateUser } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

 

// 🔒 POST /users — Admin only
router.post("/", verifyToken, allowRoles("admin"), registerUser);

// 🔒 GET /users — Admin & Manager
router.get("/", verifyToken, allowRoles("admin", "manager","staff"), getAllUsers);

// 🔒 PATCH /users/:id — Admin only
router.patch("/:id", verifyToken, allowRoles("admin"), updateUser);





 

export default router;
