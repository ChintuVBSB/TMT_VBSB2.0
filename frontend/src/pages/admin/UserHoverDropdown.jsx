import { useEffect, useState } from "react";
import axios from "../../services/api";
import { getToken, removeToken } from "../../utils/token";
import { useNavigate } from "react-router-dom";
import Avatar from "boring-avatars";
import { motion, AnimatePresence } from "framer-motion";
import ProfileModal from "../../components/ProfileModal";

const UserHoverDropdown = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await axios.get("/auth/profile", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user", err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <div
      className="relative inline-block text-left z-50"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      {/* Avatar */}
      {user?.photo ? (
        <img
          src={user.photo}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-600"
        />
      ) : (
        <Avatar
          size={40}
          name={user?.name || "User"}
          variant="beam"
          colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
        />
      )}

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-60 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg"
          >
            <div className="p-4 space-y-1">
              <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold">
                {user?.role || "No Role"}
              </p>
              <p className="text-gray-800 font-bold truncate">{user?.name || "Unknown"}</p>
              <p className="text-gray-500 text-sm truncate">{user?.email || "No email"}</p>

              {/* Edit Profile */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="mt-3 w-full border border-blue-600 text-blue-600 text-sm font-medium py-1.5 rounded-md hover:bg-blue-50 transition"
              >
                Edit Profile
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          refreshUser={refreshUser}
        />
      )}
    </div>
  );
};

export default UserHoverDropdown;
