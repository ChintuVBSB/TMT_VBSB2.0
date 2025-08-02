import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ label = "Go Back", className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 p-2 text-black hover:underline font-bold ${className}`}
    >
      <FiArrowLeft className="text-lg" />
      {label}
    </button>
  );
};

export default BackButton;
