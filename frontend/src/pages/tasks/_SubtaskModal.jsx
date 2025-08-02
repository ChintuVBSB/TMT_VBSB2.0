// 1. SubtaskModal.jsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { getToken } from "../../utils/token";
import axios from "../../services/api";
import toast from "react-hot-toast";

const _SubtaskModal = ({ isOpen, onClose, parentTaskId, onSubtaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(
        `/assign/tasks/${parentTaskId}/subtask`,
        {
          title,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        }
      );

      toast.success("Subtask created");
      setTitle("");
      setDescription("");
      onSubtaskCreated();
      onClose();
    } catch (err) {
      toast.error("Failed to create subtask");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4 bg-black/40 backdrop-blur-sm transition-opacity">
        <Dialog.Panel className="bg-white p-6 rounded shadow-md w-full max-w-md animate-fade-in">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Assign Subtask
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subtask Title
              </label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded mt-1"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full border px-3 py-2 rounded mt-1 resize-none"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default _SubtaskModal;
