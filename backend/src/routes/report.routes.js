import express from "express";
import {  exportMISReport,   exportWeeklySummaryCSV,   getClientServiceReport, getSlaAdherenceReport, getStaffReport, getTaskBucketReport, getTaskPriorityReport, getTaskStatusReport, getTimeLogChartData,   } from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.get("/staff", verifyToken, getStaffReport); // /api/reports/staff

//Admin dashboard
router.get("/task-status", verifyToken, getTaskStatusReport);
router.get("/service-delivery", verifyToken, getClientServiceReport);
router.get("/timelog-chart", verifyToken, getTimeLogChartData);
router.get("/task-priority", verifyToken, getTaskPriorityReport);
router.get("/sla-adherence", verifyToken, getSlaAdherenceReport);
router.get("/task-buckets", verifyToken, getTaskBucketReport);

router.get("/mis-export", verifyToken, exportMISReport);
router.get("/weekly-summary", verifyToken, exportWeeklySummaryCSV);

export default router;
