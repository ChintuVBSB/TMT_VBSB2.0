// src/components/navbars/NavbarSwitcher.jsx
import React from "react";
import { getToken, getUserRole } from "../../utils/token";
import LoginNavbar from "./LoginNavbar";
import AdminNavbar from "./AdminNavbar";
import StaffNavbar from "./StaffNavbar";

const NavbarSwitcher = () => {
  const token = getToken();
  const role = getUserRole();

  if (!token) return <LoginNavbar />;

  if (role === "admin" || role === "manager") return <AdminNavbar />;
  if (role === "staff") return <StaffNavbar />;

  return <LoginNavbar />;
};

export default NavbarSwitcher;
