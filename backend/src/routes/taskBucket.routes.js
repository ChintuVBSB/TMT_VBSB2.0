import express from "express";
import { createBucket, getAllTaskBuckets, getBuckets, uploadTaskBuckets } from "../controllers/taskBucket.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createBucket);      // add new service
router.get("/", getBuckets);   
//Admin side 
router.get("/task-buckets", verifyToken, getAllTaskBuckets);     // get all services
router.post("/upload", verifyToken, uploadTaskBuckets);


export default router;
