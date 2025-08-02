// src/components/RejectModal.jsx
import { useState } from "react";

const RejectModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
       if (reason.trim() === "") {
      alert("Please provide a reason for rejection.");
      return;
    }
    onSubmit(reason);
    setReason(""); // Clear after submit

  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000b1] bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Reason for Rejection</h2>
        <textarea
          rows={4}
          placeholder="Please provide a reason..."
          className="w-full p-3 border border-gray-300 rounded"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            className="px-4 py-2 rounded bg-blue-800  text-white"
            onClick={handleSubmit}
          >
            Submit & Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
