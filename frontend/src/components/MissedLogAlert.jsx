import React, { useEffect, useState } from "react";
import axios from "../services/api";

const MissedLogAlert = ({ userId }) => {
  const [missedToday, setMissedToday] = useState(false);

  useEffect(() => {
    const checkMissedLog = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const res = await axios.get(`/missedLogs`);
        
        // filter out only current user missed logs for today
        const userMissed = res.data.find(
          (log) => log.user?.id === userId && log.date === today
        );

        if (userMissed) {
          setMissedToday(true);
        }
      } catch (err) {
        console.error("Error fetching missed logs", err);
      }
    };

    checkMissedLog();
  }, [userId]);

  if (!missedToday) return null;

  return (
    <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-lg shadow-md animate-pulse">
      <h3 className="font-bold">⚠️ Missed Log Alert</h3>
      <p>You missed logging your work hours for today. Please update your time entry.</p>
    </div>
  );
};

export default MissedLogAlert;
