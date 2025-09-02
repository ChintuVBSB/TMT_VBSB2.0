// server.js
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";
import { initSocket } from "./src/socket/socket.js"; // ✅ Correct import
import recurringTaskCron from './src/cron/recurringTaskCron.js'
recurringTaskCron()


dotenv.config();

const PORT = process.env.PORT || 8000;

// ✅ MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch(err => {
  console.error("❌ MongoDB error:", err);
});

// ✅ HTTP Server
const server = http.createServer(app);

// ✅ Init Socket (this runs your real socket logic!)
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});