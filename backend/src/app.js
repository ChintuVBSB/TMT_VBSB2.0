// app.js
import dotenv from "dotenv"
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from "../src/routes/authRoutes.js";
import UserRoutes from "../src/routes/user.routes.js";
import timeLogRoutes from "../src/routes/timeLog.routes.js";
import clientRoutes from "../src/routes/client.routes.js";
import taskBucketRoutes from "../src/routes/taskBucket.routes.js";
import reportRoutes from "../src/routes/report.routes.js";
import rewardRoutes from "../src/routes/rewardRoutes.js";
import projectRoutes from "../src/routes/projectRoutes.js";
import adminProjectRoutes from "../src/routes/adminProjectRoutes.js";
import chatRoutes from "../src/routes/chatRoutes.js";
import taskRoutes from "../src/routes/task.routes.js";  // ✅ Corrected path
import helmet from "helmet"
import compression from "compression"

dotenv.config();

const app = express();

// app.use(cors({
//   origin: ["http://localhost:5173", "https://vbsbtmt.netlify.app"],
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   credentials: true
// }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet({
  crossOriginResourcePolicy: false, // 👈 disables the blocking header
}));  // 🛡 Security
app.use(compression());  // 🚀 Speed  

// ✅ ALL ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/timelog", timeLogRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/task-buckets", taskBucketRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin/projects", adminProjectRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/assign", taskRoutes); // ✅ This contains /tasks/my etc.
app.use("/uploads", express.static("uploads"));


 

export default app;