// src/socket.js
import { io } from "socket.io-client";

// The socket URL is set dynamically via an env variable
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
