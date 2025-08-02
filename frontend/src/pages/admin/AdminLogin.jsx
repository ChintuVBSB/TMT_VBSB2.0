import { useState } from "react";
import axios from "../../services/api.js";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/admin/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-blue-200"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">
          Admin Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition duration-200"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
