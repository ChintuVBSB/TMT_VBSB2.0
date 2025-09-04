import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../services/api";
import { MessageCircleMore, X } from "lucide-react";

let socket;

const ChatBox = ({ projectId, user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    // 🔌 Use env variable for Socket.IO URL
    socket = io(import.meta.env.VITE_SOCKET_URL);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    return () => {
      socket.disconnect();
      console.log("❌ Socket disconnected");
    };
  }, []);

  useEffect(() => {
    if (!projectId || !user?._id || !socket) return;

    socket.emit("joinProjectRoom", { projectId, userId: user._id });
    console.log("👥 Joined Room:", projectId);

    socket.on("receiveMessage", (messageData) => {
      console.log("📩 New message received:", messageData);
      setMessages((prev) => [...prev, messageData]);
    });

    return () => socket.off("receiveMessage");
  }, [projectId, user?._id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chat/${projectId}`);
        console.log("💬 Chats:", res.data);
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
      }
    };
    if (projectId) fetchMessages();
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const messageData = {
      sender: { _id: user._id },
      message: input,
      createdAt: new Date(),
    };

    console.log("🚀 Sending message:", { projectId, messageData });

    socket.emit("sendMessage", { projectId, messageData });
    setInput("");
  };

  return (
    <div
      className="fixed top-[85px] right-0 w-full sm:w-[400px] h-[calc(90vh-85px)] 
                 bg-white shadow-lg z-50 flex flex-col border-l border-gray-200"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-blue-800 text-white shadow">
        <h2 className="text-lg flex items-center gap-2 font-semibold">
          <MessageCircleMore /> Project Chat
        </h2>
        <button
          onClick={onClose}
          className="text-white text-xl font-bold hover:scale-105"
        >
          <X />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50">
        {messages.map((msg, index) => {
          const isSelf = msg?.sender?._id === user._id;
          const name = msg?.sender?.name || "Unknown";
          const role = msg?.sender?.role || "member";

          return (
            <div
              key={index}
              className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-lg shadow text-sm 
                            ${isSelf ? "bg-blue-100 text-right" : "bg-gray-100 text-left"}`}
              >
                <p className="font-semibold text-gray-800">
                  {name}{" "}
                  <span className="text-xs text-gray-500 italic">
                    ({role === "team_lead" ? "Team Leader" : role})
                  </span>
                </p>
                <p className="text-gray-700 break-words">{msg.message}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString()
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t p-3 bg-white flex gap-2 items-center">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
