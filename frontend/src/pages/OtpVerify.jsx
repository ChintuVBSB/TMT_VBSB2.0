import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../services/api";
import { setToken } from "../utils/token";
import toast from "react-hot-toast";

function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const [resendTimer, setResendTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/verify-otp", { userId, otp });
      setToken(res.data.token);
      toast.success("OTP Verified");

      const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
      const role = decoded.role;

      if (role === "admin" || role === "manager") {
        navigate("/");
      } else {
        navigate("/staff/home");
      }
    } catch (err) {
      console.error("OTP verify error", err);
      toast.error("Invalid or expired OTP");
    }
  };

  const handleResendOTP = async () => {
    if (!userId) return toast.error("User ID missing. Please restart login.");

    setIsResending(true);
    try {
      await axios.post("/auth/resend-otp", { userId });
      toast.success("📩 OTP resent to your email");
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await axios.post("/auth/resend-otp", { userId: location.state.userId });
      toast.success("OTP resent to your email!");
      setResendTimer(30); // restart timer
    } catch (err) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const role = decoded.role;

      if (role === "admin" || role === "manager") {
        navigate("/");
      } else {
        navigate("/staff/home");
      }
    } catch (err) {
      console.error("Token decode error:", err);
      // Agar token corrupted hai to hata de
      localStorage.removeItem("token");
    }
  }
}, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md bg-white border-4 border-purple-900 rounded-lg shadow-lg p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-purple-800">
          Enter OTP 🔐
        </h2>
        <p className="text-sm text-gray-500 text-center">
          Check your email for the OTP. It's valid for 2 minutes.
        </p>

        <input
          type="text"
          autocomplete="one-time-code" 
          inputmode="numeric"
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-3 bg-[#f5f1fa] rounded-lg outline-none text-center text-lg tracking-widest"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <div className="flex flex-col gap-3 justify-between items-center">
          <button
            type="submit"
            className="w-full bg-purple-800 text-white font-semibold py-2 rounded-full hover:bg-purple-600 transition"
          >
            Verify OTP
          </button>

          {/* Resend OTP Button */}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0 || loading}
            className="text-blue-600 hover:underline text-sm disabled:text-gray-400"
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VerifyOTP;
