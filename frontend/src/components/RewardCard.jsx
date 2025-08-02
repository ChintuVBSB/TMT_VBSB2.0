// components/RewardCard.jsx
import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { getToken } from "../utils/token";

const RewardCard = () => {
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchWinner = async () => {
      try {
        const { data } = await axios.get("/rewards/monthly-winner",{
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setWinner(data);
      } catch (err) {
        console.error("Failed to fetch winner", err);
      }
    };
    fetchWinner();
  }, []);

  if (!winner?.name) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 shadow-md">
      <h2 className="text-lg font-bold text-yellow-800">🎉 Monthly Reward Winner 🎉</h2>
      <p className="mt-2 text-sm text-yellow-700">Name: {winner.name}</p>
      <p className="text-sm text-yellow-700">Tasks Completed: {winner.totalTasks}</p>
      <div className="mt-3 animate-bounce text-xl">🥳🎊</div>
    </div>
  );
};

export default RewardCard;
