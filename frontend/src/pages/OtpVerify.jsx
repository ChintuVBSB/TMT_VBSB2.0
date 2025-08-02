import { useState } from "react";
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
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-3 bg-[#f5f1fa] rounded-lg outline-none text-center text-lg tracking-widest"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-purple-800 text-white font-semibold py-2 rounded-full hover:bg-purple-600 transition"
        >
          Verify OTP
        </button>

        {/* Resend OTP Button */}
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isResending}
          className="w-full text-purple-700 hover:text-purple-900 mt-2 text-sm underline"
        >
          {/* {isResending ? "Sending OTP..." : "Resend OTP"} */}
        </button>
      </form>
    </div>
  );
}

export default VerifyOTP;
