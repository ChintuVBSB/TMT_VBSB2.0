import express from "express";
import { getAllProjects } from "../controllers/adminProjectController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all-projects", verifyToken, getAllProjects);

export default router;
