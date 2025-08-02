import express from "express";
import { acceptTask, completeTask, createTask,   addSubtaskToTask, deleteTask, getAllTasks, getMyTasks, getSingleTask, reassignTask, rejectTask,   updateTask, completeSubtask, addRemark, getRemark, requestRetry, acceptRetryRequest, getRecurringTasks, updateTaskStatus, sendTaskReminder, reassignTaskByStaff, getAllTaskLogs, getCommentsForTask, addCommentToTask } from "../controllers/task.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // e.g. .pdf, .docx
    const cleanName = file.originalname.split(" ").join("_"); // remove spaces
    cb(null, uniqueSuffix + "-" + cleanName);
  }
});

const upload = multer({ storage });


router.post("/tasks", verifyToken, upload.array("attachments"),createTask);
router.get("/tasks/recurring", verifyToken, getRecurringTasks);
router.get("/tasks", verifyToken, getAllTasks);
router.get("/tasks/my", verifyToken, getMyTasks);
console.log("✅ Reminder route loaded");

router.get("/tasks/logs", verifyToken, getAllTaskLogs);


//Quick reminderr
router.post("/tasks/reminder", verifyToken, sendTaskReminder);
router.patch("/tasks/accept/:id", verifyToken, acceptTask);
router.patch("/tasks/complete/:id", verifyToken, completeTask);
router.get("/tasks/:id", verifyToken, getSingleTask);
router.patch("/tasks/:id", verifyToken, updateTask);
router.delete("/tasks/:id", verifyToken, deleteTask);
router.patch("/tasks/reject/:taskId", verifyToken, rejectTask);
router.patch("/reassign/:taskId", verifyToken, reassignTask);

//comment on tasks
// GET all comments for a specific task
router.get('/tasks/:taskId/comments', verifyToken, getCommentsForTask);

// POST a new comment to a specific task
router.post('/tasks/:taskId/comments', verifyToken, addCommentToTask);

router.patch("/reassign/staff/:taskId", verifyToken, reassignTaskByStaff);

router.post("/tasks/:id/subtask", verifyToken, addSubtaskToTask);
router.patch('/tasks/:taskId/subtask/:index/complete', verifyToken, completeSubtask);

router.post('/tasks/remark/:id', verifyToken, addRemark);
router.get("/tasks/:id/remark",verifyToken, getRemark);

router.post("/tasks/retry-request/:id", verifyToken, requestRetry);


router.patch("/tasks/accept-retry/:id", verifyToken, acceptRetryRequest);



 //Kanban
router.patch("/tasks/:id/status", verifyToken, updateTaskStatus);








// router.get("/staff/workload", verifyToken, getStaffWorkload);



export default router;
