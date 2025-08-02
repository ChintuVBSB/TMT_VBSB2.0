// ✅ Shared store for Socket.IO
let ioInstance = null;
const onlineUsers = new Map(); // Using Map for better reliability

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => {
  if (!ioInstance) throw new Error("Socket.io not initialized!");
  return ioInstance;
};

export const getOnlineUsers = () => onlineUsers;
