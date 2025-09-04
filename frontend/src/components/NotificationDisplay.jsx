import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { getToken } from "../utils/token";

const NotificationDisplay = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "/notifications/my",
        {
          headers: { Authorization: `Bearer ${getToken()}` }
        }
      );
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error(
        "Error fetching notifications:",
        err.response?.data || err.message
      );
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        "/notifications/read",
        { notificationId },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setNotifications((prev) =>
        prev.filter((notif) => notif._id !== notificationId)
      );
    } catch (err) {
      console.error(
        "Error marking as read:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      {notifications.length === 0 ? (
        <p className="text-gray-400 text-sm">No new reminders.</p>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className="flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs "
          >
            <div className="flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px]">
              <div className="flex  gap-2 items-center">
                <div className="text-[#2b9875] z-0  bg-white/5 backdrop-blur-xl p-1 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-bell-icon lucide-bell"
                  >
                    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <p className="text-white">{notif.message}</p>
                  {notif.task && (
                    <p className="text-gray-500 text-[10px] sm:text-xs">
                      Task: {notif.task.title} - Due:{" "}
                      {new Date(notif.task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => markAsRead(notif._id)}
                className="text-gray-600  hover:bg-white/5 p-1 rounded-md transition-colors ease-linear"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationDisplay;
