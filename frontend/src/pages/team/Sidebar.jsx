import {
  Home,
  ListTodo,
  Calendar,
  Clock,
  BarChart2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Droid from "../../components/Droid";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop collapse

  const navItems = [
    { label: "Dashboard", icon: <Home className="w-5 h-5" />, route: "/staff/dashboard" },
    { label: "Tasks", icon: <ListTodo className="w-5 h-5" />, route: "/staff/tasks" },
    { label: "Calendar", icon: <Calendar className="w-5 h-5" />, route: "/staff/calendar" },
    { label: "Time Logs", icon: <Clock className="w-5 h-5" />, route: "/staff/time-logs" },
    { label: "Reports", icon: <BarChart2 className="w-5 h-5" />, route: "/staff/report" },
  ];

  return (
    <div
      className={`
        fixed z-40 top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:flex-shrink-0
        ${isCollapsed ? "md:w-[60px]" : "md:w-64"}
      `}
    >
      {/* Mobile header */}
      <div className="flex justify-between items-center mb-4 px-4 pt-4 md:hidden">
        <img className="w-[8vw]" src="/VBSB-Logo-1-2048x754.png" alt="logo" />
        <button onClick={toggleSidebar}>
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-4 pt-6 mb-6">
        {!isCollapsed && (
          <div>
            <img className="w-[8vw] mb-2" src="/VBSB-Logo-1-2048x754.png" alt="logo" />
            <p className="text-sm text-blue-900 font-medium">Manage Your Tasks Efficiently</p>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-500 hover:text-black">
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="space-y-2 px-3">
        {navItems.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(item.route);
              toggleSidebar(); // close on mobile
            }}
            className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
          >
            {item.icon}
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </div>
        ))}

        <div className="mt-6">{!isCollapsed && <Droid />}</div>
      </nav>
    </div>
  );
};

export default Sidebar;
