import express from "express";
import { createProject, getProjects, getProjectById, completeMilestone, addMilestoneToProject } from "../controllers/projectController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/", verifyToken, createProject);
router.get("/my", verifyToken, getProjects);
router.get("/projects", verifyToken, getProjectById);
router.patch("/:projectId/milestone/:milestoneId", verifyToken, completeMilestone);
router.post("/:projectId/add-milestone", verifyToken, addMilestoneToProject);




export default router;  