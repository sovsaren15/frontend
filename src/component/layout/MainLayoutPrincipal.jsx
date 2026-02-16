import { useState, useEffect } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { request } from "../../util/request";
import {
  Home,
  Building2,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Navbar from "./Navbar";

const MainLayoutPrincipal = () => {
  const [openMenu, setOpenMenu] = useState("school");
  // 1. Added State for expansion (Default collapsed to match your style)
  const [isExpanded, setIsExpanded] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolName, setSchoolName] = useState("ប្រព័ន្ធគ្រប់គ្រង");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await request("/schools", "GET");
        let logo = null;
        let name = "ប្រព័ន្ធគ្រប់គ្រង";

        if (Array.isArray(res.data) && res.data.length > 0) {
          logo = res.data[0].logo;
          name = res.data[0].name;
        } else if (res.data && (res.data.logo || res.data.name)) {
          logo = res.data.logo;
          name = res.data.name;
        } else if (Array.isArray(res) && res.length > 0) {
          logo = res[0].logo;
          name = res[0].name;
        }
        setSchoolLogo(logo);
        if (name) setSchoolName(name);
      } catch (error) {
        console.error("Failed to fetch school logo", error);
      }
    };
    fetchSchool();
  }, []);

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
    // 2. Auto-expand if user clicks a menu while collapsed
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Dynamic Width */}
      <div
        className={`${
          isExpanded ? "w-80" : "w-20"
        } h-screen bg-gray-50 flex flex-col shadow-lg transition-all duration-300`}
      >
        {/* Header - Click to Toggle */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-4 p-4 ${!isExpanded && "justify-center"} cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-xl mx-2 mt-2`}
          title={isExpanded ? "Click to collapse" : "Click to expand"}
        >
          {/* School Logo */}
          <div
            className={`${
              isExpanded ? "w-20 h-20 border-4" : "w-14 h-14 border-2" // Reduced border in small mode to give logo more space
            } transition-all duration-300 bg-white rounded-full flex items-center justify-center shadow-sm border-blue-600 shrink-0 overflow-hidden`}
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
                  className={`${isExpanded ? "w-16 h-16" : "w-8 h-8"} bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center`}
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
              {schoolName}
            </h1>
            <p className="text-sm text-gray-600 font-medium">ប្រព័ន្ធគ្រប់គ្រង សាលាឋមសិក្សា</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 overflow-x-hidden mt-2">
          {/* Dashboard - Active */}
          <button
            onClick={() => navigate("/principal/dashboard")}
            className={`w-full flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-2"} bg-primary text-white py-4 rounded-2xl mb-4 font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-200`}
            title="Dashboard"
          >
            <Home size={24} className="shrink-0" />
            {isExpanded && (
              <span className="text-base whitespace-nowrap">Dashboard</span>
            )}
          </button>

          {/* School Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("school")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="គ្រប់គ្រងសាលា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Building2 size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    គ្រប់គ្រងសាលា
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
                  onClick={() => navigate("/principal/schools")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  ព័ត៌មានទូទៅសាលា
                </button>
                <button
                  onClick={() => navigate("/principal/events")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  ព្រឹត្តិការណ៍ក្នុងសាលា
                </button>
              </div>
            )}
          </div>

          {/* Teacher Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("teacher")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="គ្រប់គ្រងគ្រូ"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Users size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    គ្រប់គ្រងគ្រូ
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "teacher" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {openMenu === "teacher" && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                <button
                  onClick={() => navigate("/principal/teachers")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  គ្រូទាំងអស់
                </button>
                <button
                  onClick={() => navigate("/principal/teachers/create")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  បង្កើតគ្រូ
                </button>
              </div>
            )}
          </div>

          {/* Classroom Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("class")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ថ្នាក់រៀន"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <BookOpen size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    ថ្នាក់រៀន
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

            {openMenu === "class" && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                <button
                  onClick={() => navigate("/principal/classes")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  ថ្នាក់ទាំងអស់
                </button>
                <button
                  onClick={() => navigate("/principal/classes/create")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  បង្កើតថ្នាក់
                </button>
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
                  to="/principal/students"
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
                  to="/principal/students/create"
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

          {/* Study Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("study")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ការសិក្សា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <BookOpen size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    របាយការណ៍សិក្សា
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "study" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {openMenu === "study" && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                <NavLink
                  to="/principal/results"
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
                <NavLink
                  to="/principal/attendance"
                  className={({ isActive }) =>
                    `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-gray-600 hover:text-indigo-600"
                    }`
                  }
                >
                  វត្តមានសិក្សា
                </NavLink>
              </div>
            )}
          </div>

          {/* Subject Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu("subject")}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="មុខវិជ្ជា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <BookOpen size={24} className="shrink-0" />
                {isExpanded && (
                  <span className="text-base font-semibold whitespace-nowrap">
                    មុខវិជ្ជា
                  </span>
                )}
              </div>
              {isExpanded &&
                (openMenu === "subject" ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                ))}
            </button>

            {openMenu === "subject" && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                <button
                  onClick={() => navigate("/principal/subjects")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  មុខវិជ្ជាទាំងអស់
                </button>
                <button
                  onClick={() => navigate("/principal/subjects/create")}
                  className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  បង្កើតមុខវិជ្ជា
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
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

export default MainLayoutPrincipal;
