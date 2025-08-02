import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import UserHoverDropdown from "../../pages/admin/UserHoverDropdown";

const StaffNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <header className="w-full fixed top-0 bg-white text-black px-6 py-4 shadow-sm flex items-center justify-between z-50">
        {/* 👈 Logo */}
        <div className="flex items-center gap-4">
          <a href="/">
            <img
              src="/VBSB-Logo-1-2048x754.png"
              alt="Logo"
              className="w-24 object-contain"
            />
          </a>
        </div>

        {/* ⭕ Desktop Nav Links */}
        <nav className="hidden md:flex gap-6 font-semibold text-sm mx-auto">
          <Link to="/staff/dashboard" className="hover:underline transition">
            Dashboard
          </Link>
          <Link to="/staff/recurring-tasks" className="hover:underline transition">
            Recurring Tasks
          </Link>
          <Link to="/staff/my-projects" className="hover:underline transition">
            Projects
          </Link>
          <Link to="/staff/calendar" className="hover:underline transition">
            Calendar
          </Link>
          <Link to="/staff/time-logs" className="hover:underline transition">
            Time Logs
          </Link>
          <Link to="/staff/report" className="hover:underline transition">
            Reports
          </Link>
        </nav>

        {/* User + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <UserHoverDropdown />
          </div>
          <button
            className="md:hidden text-black focus:outline-none"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* 📱 Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed top-[72px] left-0 w-full bg-white shadow-md z-40 px-6 py-4 space-y-4 text-sm font-medium md:hidden">
          <Link to="/staff/dashboard" onClick={toggleMobileMenu} className="block">
            Dashboard
          </Link>
          <Link to="/staff/tasks" onClick={toggleMobileMenu} className="block">
            Tasks
          </Link>
          <Link to="/staff/calendar" onClick={toggleMobileMenu} className="block">
            Calendar
          </Link>
          <Link to="/staff/time-logs" onClick={toggleMobileMenu} className="block">
            Time Logs
          </Link>
          <Link to="/staff/report" onClick={toggleMobileMenu} className="block">
            Reports
          </Link>

          <div className="pt-2 border-t">
            <UserHoverDropdown />
          </div>
        </div>
      )}
    </>
  );
};

export default StaffNavbar;
