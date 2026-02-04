import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  CalendarCheck,
} from "lucide-react";
import Navbar from "./Navbar";

const MainLayoutTeacher = () => {
  const [openMenu, setOpenMenu] = useState("school");
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed based on your image
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    // If sidebar is collapsed, expand it when clicking a menu item
    if (!isExpanded) setIsExpanded(true);
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Dynamic Width */}
      <div 
        className={`${
          isExpanded ? "w-80" : "w-20"
        } h-screen bg-gray-50 flex flex-col shadow-lg transition-all duration-300`}
      >
        
        {/* Header - NOW ACTS AS THE TOGGLE BUTTON */}
        {/* Added cursor-pointer and onClick to the header container */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-4 p-4 ${!isExpanded && "justify-center"} cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-xl mx-2 mt-2`}
          title={isExpanded ? "Click to collapse" : "Click to expand"}
        >
          {/* School Logo */}
          <div className={`${isExpanded ? "w-20 h-20" : "w-12 h-12"} transition-all duration-300 bg-white rounded-full flex items-center justify-center shadow-sm border-4 border-blue-600 shrink-0`}>
            <div className={`${isExpanded ? "w-16 h-16" : "w-8 h-8"} bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center`}>
              {/* Simplified Logo for Collapsed State */}
              <div className="relative">
                {isExpanded ? (
                   // Detailed icon when expanded
                   <>
                    <div className="w-8 h-6 bg-white rounded-sm"></div>
                    <div className="absolute top-1 left-1 w-6 h-1 bg-green-500"></div>
                    <div className="absolute top-3 left-1 w-6 h-1 bg-red-500"></div>
                    <div className="absolute -top-2 left-3 w-0.5 h-2 bg-yellow-400 rotate-0"></div>
                    <div className="absolute -top-1 left-5 w-0.5 h-2 bg-yellow-400 rotate-45"></div>
                    <div className="absolute -top-1 left-1 w-0.5 h-2 bg-yellow-400 -rotate-45"></div>
                   </>
                ) : (
                   // Simple dot/icon when collapsed (like the blue circle in your image)
                   <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>

          {/* School Name - Hidden if collapsed */}
          <div className={`transition-opacity duration-200 ${!isExpanded ? "hidden opacity-0" : "block opacity-100"}`}>
            <h1 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">
              សាលាបឋមសិក្សា
            </h1>
            <p className="text-sm text-gray-600 font-medium">ចំការចេក</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 overflow-x-hidden mt-4">
          {/* Dashboard */}
          <button
            onClick={() => navigate("/teacher/dashboard")}
            className={`w-full flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-2"} bg-primary text-white py-4 rounded-2xl mb-4 font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-200`}
            title="Dashboard"
          >
            <Home size={24} className="shrink-0" />
            {isExpanded && <span className="text-base whitespace-nowrap">Dashboard</span>}
          </button>

          {/* Classroom Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("class")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ថ្នាក់រៀនរបស់ខ្ញុំ"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <BookOpen size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">ថ្នាក់រៀនរបស់ខ្ញុំ</span>}
              </div>
              {isExpanded && (
                openMenu === "class" ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>

            {/* Submenu - Only show if sidebar is Expanded AND menu is open */}
            {openMenu === "class" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/classes"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  ថ្នាក់ទាំងអស់
                </NavLink>
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("attendance")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ការគ្រប់គ្រងវត្តមាន"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <CalendarCheck size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">ការគ្រប់គ្រងវត្តមាន</span>}
              </div>
              {isExpanded && (
                openMenu === "attendance" ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>

            {openMenu === "attendance" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/attendance"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  ស្រង់វត្តមាន
                </NavLink>
                <NavLink
                  to="/teacher/attendance-report"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  របាយការណ៍វត្តមាន
                </NavLink>
              </div>
            )}
          </div>

          {/* Score */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("score")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ការគ្រប់គ្រងពិន្ទុ"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <CalendarCheck size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">ការគ្រប់គ្រងពិន្ទុ</span>}
              </div>
              {isExpanded && (
                openMenu === "score" ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>

            {openMenu === "score" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/scores"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  បញ្ជូលពិន្ទុ
                </NavLink>
                <NavLink
                  to="/teacher/score-report"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  របាយការណ៍ពិន្ទុ
                </NavLink>
              </div>
            )}
          </div>

          {/* Resources Result */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("result")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="លទ្ឋផលសិក្សា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <CalendarCheck size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">លទ្ឋផលសិក្សា</span>}
              </div>
              {isExpanded && (
                openMenu === "result" ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>

            {openMenu === "result" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/results"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  លទ្ឋផលសិក្សា
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto p-4 space-y-2">
          <button
            onClick={() => navigate("/teacher/settings")}
            className={`w-full flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
            title="ការកំណត់"
          >
            <Settings size={24} className="shrink-0" />
            {isExpanded && <span className="text-base font-semibold whitespace-nowrap">ការកំណត់</span>}
          </button>

          <button
            onClick={() => navigate("/logout")}
            className={`w-full flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
            title="ចាកចេញ"
          >
            <LogOut size={24} className="shrink-0" />
            {isExpanded && <span className="text-base font-semibold whitespace-nowrap">ចាកចេញ</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayoutTeacher;