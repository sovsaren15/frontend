import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import Navbar from './Navbar';

const MainLayoutAdmin = () => {
  const [openMenu, setOpenMenu] = useState('school');
  // 1. Added State for sidebar expansion (Default to collapsed)
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = (menuName) => {
    // 2. Auto-expand sidebar if user clicks a menu icon while collapsed
    if (!isExpanded) setIsExpanded(true);
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Helper to handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Dynamic Width */}
      <div 
        className={`${
          isExpanded ? "w-80" : "w-20"
        } h-screen bg-gray-50 flex flex-col shadow-lg transition-all duration-300`}
      >
        {/* Header - Click to Toggle Sidebar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-4 p-4 ${!isExpanded && "justify-center"} cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-xl mx-2 mt-2`}
          title={isExpanded ? "Click to collapse" : "Click to expand"}
        >
          {/* School Logo */}
          <div className={`${isExpanded ? "w-20 h-20" : "w-12 h-12"} transition-all duration-300 bg-white rounded-full flex items-center justify-center shadow-sm border-4 border-blue-600 shrink-0`}>
            <div className={`${isExpanded ? "w-16 h-16" : "w-8 h-8"} bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center`}>
               {/* Logo Logic: Complex if Expanded, Simple Dot if Collapsed */}
              <div className="relative">
                {isExpanded ? (
                  <>
                    <div className="w-8 h-6 bg-white rounded-sm"></div>
                    <div className="absolute top-1 left-1 w-6 h-1 bg-green-500"></div>
                    <div className="absolute top-3 left-1 w-6 h-1 bg-red-500"></div>
                    <div className="absolute -top-2 left-3 w-0.5 h-2 bg-yellow-400 rotate-0"></div>
                    <div className="absolute -top-1 left-5 w-0.5 h-2 bg-yellow-400 rotate-45"></div>
                    <div className="absolute -top-1 left-1 w-0.5 h-2 bg-yellow-400 -rotate-45"></div>
                  </>
                ) : (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        
          {/* School Name - Hidden if collapsed */}
          <div className={`transition-opacity duration-200 ${!isExpanded ? "hidden opacity-0" : "block opacity-100"}`}>
            <h1 className="text-lg font-bold text-gray-800 leading-tight whitespace-nowrap">សាលាបឋមសិក្សា</h1>
            <p className="text-sm text-gray-600 font-medium">ចំការចេក</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-2 overflow-x-hidden mt-4">
          {/* Dashboard - Active */}
          <button
            onClick={() => handleNavigation('/dashboard')}
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
              {isExpanded && (
                openMenu === 'school' ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>
            
            {openMenu === 'school' && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() => handleNavigation('/schools')}
                    className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    សាលាទាំងអស់
                  </button>
                  <button
                    onClick={() => handleNavigation('/schools/create')}
                    className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    បង្កើតសាលា
                  </button>
                  <button
                    onClick={() => handleNavigation('/schools/edit')}
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
              onClick={() => toggleMenu('teacher')}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="គ្រប់គ្រងគ្រូ"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <Users size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">គ្រប់គ្រងគ្រូ</span>}
              </div>
              {isExpanded && (
                openMenu === 'teacher' ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>
            
            {openMenu === 'teacher' && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() => handleNavigation('/teachers')}
                    className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    គ្រូទាំងអស់
                  </button>
                  <button
                    onClick={() => handleNavigation('/teachers/create')}
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
              onClick={() => toggleMenu('class')}
              className={`w-full flex items-center ${isExpanded ? "justify-between px-6" : "justify-center px-2"} py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200`}
              title="ថ្នាក់រៀន"
            >
              <div className={`flex items-center ${isExpanded ? "gap-4" : ""}`}>
                <BookOpen size={24} className="shrink-0" />
                {isExpanded && <span className="text-base font-semibold whitespace-nowrap">ថ្នាក់រៀន</span>}
              </div>
              {isExpanded && (
                openMenu === 'class' ? <ChevronUp size={20} /> : <ChevronDown size={20} />
              )}
            </button>
            
            {openMenu === 'class' && isExpanded && (
              <div className="mt-2 ml-14 space-y-1 border-l-2 border-gray-200 pl-4">
                  <button
                    onClick={() => handleNavigation('/classes')}
                    className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    ថ្នាក់ទាំងអស់
                  </button>
                  <button
                    onClick={() => handleNavigation('/classes/create')}
                    className="block w-full text-left py-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                  >
                    បង្កើតថ្នាក់
                  </button>
              </div>
            )}
          </div>
        </nav>

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

export default MainLayoutAdmin;