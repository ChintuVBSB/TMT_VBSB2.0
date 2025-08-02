import Sidebar from "./Sidebar";
import UserHoverDropdown from "../admin/UserHoverDropdown";
import { Menu } from "lucide-react";
import { useState } from "react";

const StaffLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="relative min-h-screen bg-white text-black">
      {/* Sidebar overlay - mobile only */}
      <div className="md:hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-30"
            onClick={toggleSidebar}
          />
        )}
      </div>

      {/* Main layout */}
      <div className="flex md:flex-row">
        {/* Sidebar - visible only on md+ */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} toggleSidebar={toggleSidebar} />
        </div>

        <div className="flex-1 flex flex-col w-full">
          {/* Topbar */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            {/* Hamburger */}
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Right menu */}
            <UserHoverDropdown />
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto pt-4 pb-6 px-4 md:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;
