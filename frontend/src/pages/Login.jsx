import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import VBSBLOGO from "../assets/VBSB-Logo-1-2048x754.png";
import toast from "react-hot-toast";
import { PiCalendarDotsDuotone } from "react-icons/pi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Robot3D from "../components/Robot3d";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });

      // ✅ Get token + user directly
      const { token, user } = res.data;

      // ✅ Save token to localStorage (or context)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!");

      // ✅ Redirect to dashboard/homepage (NO OTP step)
      navigate("/");
    } catch (err) {
      console.error("Login error", err);
      toast.error(err.response?.data?.msg || "Invalid login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col md:flex-row overflow-hidden">
        {/* Left Logo */}
        <div className="hidden md:flex items-center justify-center w-1/2 bg-[#f0f9ff] p-8">
          <img src={VBSBLOGO} alt="VBSB Logo" className="object-contain h-32" />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8 relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            Welcome to TMT <PiCalendarDotsDuotone />
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Task Management Tool by VBSB — Simple, Fast & Organized
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f9fafb] outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f9fafb] outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 cursor-pointer transition-transform duration-300 ease-in-out"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-700 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <Robot3D />
    </div>
  );
}

export default Login;
