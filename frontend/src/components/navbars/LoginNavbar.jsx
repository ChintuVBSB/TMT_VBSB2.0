// src/components/navbars/LoginNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { BiLogInCircle } from "react-icons/bi";

const LoginNavbar = () => {
  return (
    <header className="w-full bg-white text-black px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="w-28">
        <img src="/VBSB-Logo-1-2048x754.png" alt="Logo" />
      </div>
      <Link to="/login">
        <button className="border flex items-center gap-1 text-black px-6 py-2 rounded-lg hover:bg-black hover:text-white transition">
          Login <BiLogInCircle size={"1.2em"} />
        </button>
      </Link>
    </header>
  );
};

export default LoginNavbar;
