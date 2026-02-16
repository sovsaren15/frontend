import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  BookOpen, 
  UserCog,
  Settings, 
  LogOut, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import Navbar from './Navbar';

const MainLayoutAdmin = () => {
  const [openMenu, setOpenMenu] = useState('school');
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for Admin
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = (menuName) => {
    if (!isExpanded) setIsExpanded(true);
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/dashboard")) document.title = "Dashboard ";
    else if (path.includes("/admin/schools/create")) document.title = "បង្កើតសាលា";
    else if (path.includes("/admin/schools")) document.title = "គ្រប់គ្រងសាលារៀន ";
    else if (path.includes("/admin/principals/create")) document.title = "បង្កើតអ្នកគ្រប់គ្រងថ្មី";
    else if (path.includes("/admin/principals")) document.title = "គ្រប់គ្រងនាយក ";
    else if (path.includes("/admin/profile")) document.title = "ការកំណត់";
    else if (path.includes("/admin/change-password")) document.title = "ប្ដូរពាក្យសម្ងាត់";
    else document.title = "Primary School Attendance";
  }, [location]);

  return (
    <div className="flex h-screen bg-gray-100 font-kantumruy">
      {/* Sidebar - Dynamic Width */}
      <div 
        className={`${
          isExpanded ? "w-80" : "w-20"
        } h-screen bg-gray-50 flex flex-col shadow-lg transition-all duration-300`}
      >
        {/* Header - Toggle Button */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-4 p-4 ${!isExpanded && "justify-center"} cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-xl mx-2 mt-2`}
          title={isExpanded ? "Click to collapse" : "Click to expand"}
        >
          {/* Admin Logo */}
          <div 
            className={`${
              isExpanded ? "w-20 h-20 border-4" : "w-14 h-14 border-2"
            } transition-all duration-300 bg-white rounded-full flex items-center justify-center shadow-sm border-blue-600 shrink-0 overflow-hidden`}
          >
            <div className={`${isExpanded ? "w-16 h-16" : "w-10 h-10"} rounded-full flex items-center justify-center transition-all duration-300`}>
                          <img src="/slogo.svg" alt="Admin Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          
          {/* Admin Title */}
          <div className={`transition-opacity duration-200 ${!isExpanded ? "hidden opacity-0" : "block opacity-100"}`}>
            <h1 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">Admin Panel</h1>
            <p className="text-sm text-gray-600 font-medium">Ministry of Education</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 overflow-x-hidden mt-4">
          {/* Dashboard - Active */}
          <button
            onClick={() => navigate('/admin/dashboard')}
            className={`w-full flex items-center ${isExpanded ? "gap-4 px-6" : "justify-center px-2"} bg-primary text-white py-4 rounded-2xl mb-4 font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-200`}
            title="Dashboard"
          >
            <Home size={24} className="shrink-0" />
            {isExpanded && <span className="text-base whitespace-nowrap">Dashboard</span>}
          </button>

          {/* School Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu('school')}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="គ្រប់គ្រងសាលា"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Building2 size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">គ្រប់គ្រងសាលា</span>}
              </div>
              {isExpanded && (openMenu === 'school' ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
            </button>
            
            {openMenu === 'school' && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                  <NavLink
                    to="/admin/schools"
                    end
                    className={({ isActive }) => `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    សាលាទាំងអស់
                  </NavLink>
                  <NavLink
                    to="/admin/schools/create"
                    className={({ isActive }) => `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    បង្កើតសាលា
                  </NavLink>
              </div>
            )}
          </div>

          {/* Principal Management */}
          <div className="mb-2">
            <button
              onClick={() => toggleMenu('principal')}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="គ្រប់គ្រងនាយក"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <UserCog size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">គ្រប់គ្រងនាយក</span>}
              </div>
              {isExpanded && (openMenu === 'principal' ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
            </button>
            
            {openMenu === 'principal' && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                  <NavLink
                    to="/admin/principals"
                    end
                    className={({ isActive }) => `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    នាយកទាំងអស់
                  </NavLink>
                  <NavLink
                    to="/admin/principals/create"
                    className={({ isActive }) => `block w-full text-left py-2 px-2 text-sm transition-colors duration-200 ${isActive ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"}`}
                  >
                    បង្កើតនាយក
                  </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Footer Area (Optional) */}
        <div className="mt-auto p-4 space-y-2"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <footer className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Ministry of Education, Youth and Sport. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayoutAdmin;