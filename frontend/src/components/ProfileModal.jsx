import { useState } from "react";
import axios from "../services/api";
import { getToken } from "../utils/token";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage"; // 👈 create this util
import { Slider } from "@mui/material"; // Optional for zoom slider
import {UserCog} from "lucide-react";

const ProfileModal = ({ user, onClose, refreshUser }) => {
  const [name, setName] = useState(user.name || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const showCroppedImage = async () => {
    const cropped = await getCroppedImg(
      URL.createObjectURL(selectedFile),
      croppedAreaPixels
    );
    setCroppedImage(cropped);
    setShowCrop(false);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    if (croppedImage) {
      formData.append("photo", croppedImage, "profile.jpg");
    }

    try {
      setLoading(true);
      await axios.patch("/auth/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data"
        }
      });
      await refreshUser();
      onClose();
    } catch (err) {
      console.error("Error updating profile", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h2 className="text-xl flex items-center gap-2 font-semibold mb-4"><UserCog /> Edit Profile</h2>
        <div className="flex w-full items-center justify-center mb-4">
        {croppedImage && (
          <img
            src={URL.createObjectURL(croppedImage)}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border mt-2"
          />
        )}
        </div>
        <div className="space-y-4">
          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(e.target.files[0]);
                setShowCrop(true);
              }}
              className="mt-1"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>

        {/* Crop Modal */}
        {showCrop && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-5 rounded-lg w-[90%] max-w-lg">
              <h3 className="text-lg font-bold mb-4">Crop your image</h3>
              <div className="relative w-full h-64 bg-gray-100">
                <Cropper
                  image={selectedFile && URL.createObjectURL(selectedFile)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e, z) => setZoom(z)}
                className="mt-4"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowCrop(false)}
                  className="text-gray-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={showCroppedImage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Crop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
