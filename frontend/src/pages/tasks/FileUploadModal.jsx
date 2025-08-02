// src/components/FileUploadModal.jsx
import { useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";

const FileUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    onUpload(files); // send to parent
    setFiles([]);
    onClose(); // close modal
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
          <MdClose size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Files</h2>

        {/* Drag Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          <FiUploadCloud size={32} className="mx-auto mb-2" />
          Drag and drop files here or click to select
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Selected File List */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex justify-between items-center text-sm border p-2 rounded">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="px-4 py-2 rounded-md bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
