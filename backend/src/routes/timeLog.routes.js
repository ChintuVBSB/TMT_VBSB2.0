import express from "express";
import { addTimeLog, deleteDraftLog, exportTimeLogsByUser, getDraftLogs, getLogsByDate, getTimeLogsByUser, saveDraftTimeLog, submitAllLogs, updateDraftLog } from "../controllers/timeLog.controller.js";
import {verifyToken} from "../middlewares/authMiddleware.js";

const router = express.Router();


// Staff logs time
router.post("/", verifyToken, addTimeLog);
router.get("/export-logs", verifyToken, exportTimeLogsByUser);
router.get("/my", verifyToken, getTimeLogsByUser); // get logs 


router.post("/save-draft", verifyToken,  saveDraftTimeLog); 
router.get("/drafts", verifyToken,  getDraftLogs); 
router.patch("/submit-all", verifyToken, submitAllLogs); 

router.put("/:id",  verifyToken, updateDraftLog);

router.get("/:date", verifyToken, getLogsByDate);
// DELETE
router.delete("/:id", verifyToken, deleteDraftLog);

// Admin/staff view logs of a task
router.get("/:taskId", verifyToken, getTimeLogsByUser);



export default router;
