import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

const MianLayout = () => {
  const [openMenu, setOpenMenu] = useState('school');

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleNavigation = (path) => {
    // Handle navigation logic here
    console.log('Navigate to:', path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 h-screen bg-gray-50 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-4 p-6">
        {/* School Logo */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border-4 border-blue-600">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
            <div className="relative">
              {/* Book icon */}
              <div className="w-8 h-6 bg-white rounded-sm"></div>
              <div className="absolute top-1 left-1 w-6 h-1 bg-green-500"></div>
              <div className="absolute top-3 left-1 w-6 h-1 bg-red-500"></div>
              {/* Sun rays */}
              <div className="absolute -top-2 left-3 w-0.5 h-2 bg-yellow-400 rotate-0"></div>
              <div className="absolute -top-1 left-5 w-0.5 h-2 bg-yellow-400 rotate-45"></div>
              <div className="absolute -top-1 left-1 w-0.5 h-2 bg-yellow-400 -rotate-45"></div>
            </div>
          </div>
        </div>
        
        {/* School Name */}
        <div>
          <h1 className="text-lg font-bold text-gray-800 leading-tight">សាលាបឋមសិក្សា</h1>
          <p className="text-sm text-gray-600 font-medium">ចំការចេក</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2">
        {/* Dashboard - Active */}
        <button
          onClick={() => handleNavigation('/dashboard')}
          className="w-full flex items-center gap-4 bg-primary text-white px-6 py-4 rounded-2xl mb-4 font-semibold shadow-lg hover:bg-indigo-700 transition-all duration-200"
        >
          <Home size={24} />
          <span className="text-base">Dashboard</span>
        </button>

        {/* School Management */}
        <div className="mb-2">
          <button
            onClick={() => toggleMenu('school')}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <Building2 size={24} />
              <span className="text-base font-semibold">គ្រប់គ្រងសាលា</span>
            </div>
            {openMenu === 'school' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openMenu === 'school' && (
            <div className="mt-2 ml-14 space-y-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="pl-6 space-y-2">
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
              </div>
            </div>
          )}
        </div>

        {/* Teacher Management */}
        <div className="mb-2">
          <button
            onClick={() => toggleMenu('teacher')}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <Users size={24} />
              <span className="text-base font-semibold">គ្រប់គ្រងគ្រូ</span>
            </div>
            {openMenu === 'teacher' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openMenu === 'teacher' && (
            <div className="mt-2 ml-14 space-y-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="pl-6 space-y-2">
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
              </div>
            </div>
          )}
        </div>

        {/* Classroom Management */}
        <div className="mb-2">
          <button
            onClick={() => toggleMenu('class')}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <BookOpen size={24} />
              <span className="text-base font-semibold">ថ្នាក់រៀន</span>
            </div>
            {openMenu === 'class' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {openMenu === 'class' && (
            <div className="mt-2 ml-14 space-y-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="pl-6 space-y-2">
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
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 space-y-2">
        <button
          onClick={() => handleNavigation('/settings')}
          className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200"
        >
          <Settings size={24} />
          <span className="text-base font-semibold">ការកំណត់</span>
        </button>
        
        <button
          onClick={() => handleNavigation('/logout')}
          className="w-full flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200"
        >
          <LogOut size={24} />
          <span className="text-base font-semibold">ចាកចេញ</span>
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

export default MianLayout;