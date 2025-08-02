import React from "react";

const Progress = ({ value, max = 100 }) => {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
};

export default Progress;
