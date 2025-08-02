// src/socket.js
import { io } from "socket.io-client";

// ✅ Use your backend URL
const socket = io("http://localhost:8000/api", {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
