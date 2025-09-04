// src/socket.js
import { io } from "socket.io-client";

// ✅ Use your backend URL
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
