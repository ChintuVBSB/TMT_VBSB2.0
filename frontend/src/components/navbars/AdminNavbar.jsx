// src/components/navbars/AdminNavbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import UserHoverDropdown from "../../pages/admin/UserHoverDropdown";
import { motion, AnimatePresence } from "framer-motion";

const AdminNavbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinkClass = (path) =>
    `transition pb-2 ${
      isActive(path)
        ? "border-b-2 border-blue-600 text-blue-600"
        : "hover:text-blue-600"
    }`;

  const dropdownItems = [
    { label: "Create Task", path: "/admin/create-task" },
    { label: "Create Project", path: "/admin/create-project" },
    { label: "Add Client", path: "/admin/add-client" },
    { label: "Add Task Bucket", path: "/admin/add-task-bucket" }
  ];

  const viewLinks = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "All Tasks", path: "/admin/tasks" },
    { label: "Users", path: "/admin/allusers" },
    { label: "All Projects", path: "/admin/projects" },
    { label: "Time Sheet", path: "/admin/manager/timesheet" },
    { label: "Task List", path: "/admin/alltasklist" },
    { label: "Activity Logs", path: "/admin/activity-logs" }
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white text-black px-6 py-4 shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="w-28">
          <a href="/">
            <img src="/VBSB-Logo-1-2048x754.png" alt="Logo" />
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex  flex-1 justify-center items-center gap-6 font-medium text-sm">
          {viewLinks.map((link) => (
            <Link key={link.path} to={link.path} className={navLinkClass(link.path)}>
              {link.label}
            </Link>
          ))}

          <div onMouseEnter={setDropdownOpen} onMouseLeave={() => setDropdownOpen(false)}  className="relative flex items-center gap-1 cursor-pointer">
             Create <ChevronDown size={16} />
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-48 bg-white border rounded border-gray-200 shadow-lg overflow-hidden z-50"
                >
                  <div className="px-4 py-2 flex items-center justify-start font-semibold text-gray-400   border-b border-gray-200">
                    Creation
                  </div>
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                    >
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Profile */}
        <div className="hidden md:flex justify-end">
          <UserHoverDropdown />
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 space-y-2"
          >
            {[...viewLinks, ...dropdownItems].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2 text-sm hover:bg-blue-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4">
              <UserHoverDropdown />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdminNavbar;
