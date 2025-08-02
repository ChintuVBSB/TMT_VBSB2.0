import { Server } from "socket.io";
import { getOnlineUsers, setIO } from "../../utils/socketStore.js";
import chatMessage from "../models/chatMessage.js"; // Chat untouched ✅

export const initSocket = async (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "PUT"],
    },
  });

  setIO(io); // ✅ Save instance for use in controllers

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // ✅ Only reminder logic
    socket.on("join", (userId) => {
      getOnlineUsers().set(userId, socket.id);
      console.log(`✅ User ${userId} joined (Reminder system)`);
    });

    socket.on("disconnect", () => {
      for (let [userId, socketId] of getOnlineUsers()) {
        if (socketId === socket.id) {
          getOnlineUsers().delete(userId);
          console.log(`❌ User ${userId} disconnected`);
          break;
        }
      }
    });

    // ✅ Chat-related logic untouched here
    socket.on("joinProjectRoom", ({ projectId, userId }) => {
      socket.join(projectId);
      console.log(`👥 User ${userId} joined room ${projectId}`);
    });

    socket.on("sendMessage", async ({ projectId, messageData }) => {
      try {
        const saved = await chatMessage.create({
          projectId,
          sender: messageData.sender._id,
          message: messageData.message,
        });

        const fullMessage = await saved.populate("sender", "name role");
        io.to(projectId).emit("receiveMessage", fullMessage);
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    });
  });

  return io;
};
