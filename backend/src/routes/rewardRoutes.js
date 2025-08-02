// routes/rewardRoutes.js
import express from "express";
import { getMonthlyTopPerformer } from "../controllers/rewardController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/monthly-winner",verifyToken, getMonthlyTopPerformer);
export default router;
