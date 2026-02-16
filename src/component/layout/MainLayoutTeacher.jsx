import { useState, useEffect } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import { request } from "../../util/request";
import {
  Home,
  BookOpen,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
  CalendarCheck,
  Users,
  Award,
  Building2,
} from "lucide-react";
import Navbar from "./Navbar";

const MainLayoutTeacher = () => {
  const [openMenu, setOpenMenu] = useState("school");
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed based on your image
  const [schoolName, setSchoolName] = useState("សាលាបឋមសិក្សា");
  const [schoolLogo, setSchoolLogo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const normalizedPath = imagePath.replace(/\\/g, "/");
    const relativePath = normalizedPath.includes("uploads/")
      ? normalizedPath.substring(normalizedPath.indexOf("uploads/"))
      : normalizedPath;
    return `http://localhost:8081/${relativePath}`;
  };

  const toggleMenu = (menuName) => {
    // If sidebar is collapsed, expand it when clicking a menu item
    if (!isExpanded) setIsExpanded(true);
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/teacher/dashboard")) document.title = "Dashboard ";
    else if (path.includes("/teacher/schools")) document.title = "School Information";
    else if (path.includes("/teacher/events")) document.title = "Events";
    else if (path.includes("/teacher/classes")) document.title = "Classes ";
    else if (path.includes("/teacher/students")) document.title = "Students ";
    else if (path.includes("/teacher/attendance")) document.title = "Attendance";
    else if (path.includes("/teacher/scores")) document.title = "Scores ";
    else if (path.includes("/teacher/results")) document.title = "Results ";
    else if (path.includes("/teacher/profile")) document.title = "Profile ";
    else document.title = "Primary School Attendance";
  }, [location]);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        const res = await request('/teachers/me', 'GET');
        if (res.data) {
          if (res.data.school_name) {
            setSchoolName(res.data.school_name);
          }
          if (res.data.school_id) {
            const schoolRes = await request(`/schools/${res.data.school_id}`, 'GET');
            if (schoolRes.data && schoolRes.data.logo) {
              setSchoolLogo(schoolRes.data.logo);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch school details", error);
      }
    };
    fetchSchoolDetails();
  }, []);

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
          <div
            className={`${
              isExpanded ? "w-20 h-20 border-4" : "w-14 h-14 border-2" // Reduced border in small mode to give logo more space
            } transition-all duration-300 bg-white rounded-full flex items-center justify-center shadow-sm border-indigo-600 shrink-0 overflow-hidden`}
          >
            {schoolLogo ? (
              <img
                src={getImageUrl(schoolLogo)}
                alt="School Logo"
                // Added scale-110 (110% zoom) specifically when NOT expanded
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  !isExpanded ? "scale-125" : "scale-130"
                }`}
              />
            ) : (
              /* Placeholder Logic */
              <div className="relative">
                {/* ... keep your existing placeholder logic here ... */}
                <div
                  className={`${isExpanded ? "w-16 h-16" : "w-8 h-8"} bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center`}
                >
                  {/* ... placeholder shapes ... */}
                </div>
              </div>
            )}
          </div>

          {/* School Name - Hidden if collapsed */}
          <div
            className={`transition-opacity duration-200 ${!isExpanded ? "hidden opacity-0" : "block opacity-100"}`}
          >
            <h1 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">
              ប្រព័ន្ធគ្រប់គ្រង
            </h1>
            <p className="text-sm text-gray-600 font-medium">{schoolName}</p>
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
            {isExpanded && (
              <span className="text-base whitespace-nowrap">Dashboard</span>
            )}
          </button>
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("school")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="អំពីសាលា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Building2 size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    អំពីសាលា
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "school" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {openMenu === "school" && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                <button
                  onClick={() => navigate("/teacher/schools")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  ព័ត៌មានទូទៅសាលា
                </button>
                <button
                  onClick={() => navigate("/teacher/events")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  ព្រឹត្តិការណ៍ក្នុងសាលា
                </button>
              </div>
            )}
          </div>
          {/* Classroom Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("class")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ថ្នាក់រៀនរបស់ខ្ញុំ"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <BookOpen size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    ថ្នាក់រៀនរបស់ខ្ញុំ
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "class" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {/* Submenu - Only show if sidebar is Expanded AND menu is open */}
            {openMenu === "class" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/classes"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  ថ្នាក់ទាំងអស់
                </NavLink>
              </div>
            )}
          </div>

          <div className="mb-2">
            <button
              onClick={() => toggleMenu("students")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="គ្រប់គ្រងសិស្ស"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Users size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    គ្រប់គ្រងសិស្ស
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "students" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {/* Submenu - Only show if sidebar is Expanded AND menu is open */}
            {openMenu === "students" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/students"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  គ្រប់គ្រងសិស្ស
                </NavLink>

                                <NavLink
                  to="/teacher/students/create"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  ចុះឈ្មោះសិស្សថ្មី
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
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    ការគ្រប់គ្រងវត្តមាន
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "attendance" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {openMenu === "attendance" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/attendance"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  ស្រង់វត្តមាន
                </NavLink>
                <NavLink
                  to="/teacher/attendance-report"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
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
              title="ការគ្រប់គ្រងការសិក្សា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Award size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    ការគ្រប់គ្រងការសិក្សា
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "score" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {openMenu === "score" && isExpanded && (
              <div className="mt-2 ml-10 pl-4 border-l-2 border-gray-200">
                <NavLink
                  to="/teacher/scores"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  បញ្ជូលពិន្ទុ
                </NavLink>
                <NavLink
                  to="/teacher/results"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  លទ្ធផលសិក្សា
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto p-4 space-y-2">
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Primary School Management System. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayoutTeacher;
