import { useState, useEffect } from 'react';
import { Bell, ChevronDown, Key, LogOut, School, CircleUser, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { request } from "../../util/request";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "គ្រូថ្មី ៣ នាក់បានចុះឈ្មោះ", time: "២ នាទីមុន", unread: true },
    { id: 2, message: "របាយការណ៍ប្រចាំខែត្រូវបានអាប់ដេត", time: "១៥ នាទីមុន", unread: true },
    { id: 3, message: "ការប្រជុំគ្រូនឹងធ្វើនៅថ្ងៃស្អែក", time: "១ ម៉ោងមុន", unread: false }
  ]);

  const [schoolName, setSchoolName] = useState("ប្រព័ន្ធគ្រប់គ្រង បឋមសិក្សា");
  const [profileImage, setProfileImage] = useState(null);
  const unreadCount = notifications.filter(n => n.unread).length;

  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.school_name) setSchoolName(user.school_name);
      if (user.image_profile) setProfileImage(user.image_profile);
    }

    if (user && (!user.school_name || !user.image_profile)) {
      const fetchSchoolName = async () => {
        try {
          const role = user.role_name ? user.role_name.toLowerCase() : '';
          let res;
          if (role === 'principal') {
            res = await request('/principals/me', 'GET');
          } else if (role === 'teacher') {
            res = await request('/teachers/me', 'GET');
          }

          if (res?.data) {
            if (res.data.school_name) setSchoolName(res.data.school_name);
            if (res.data.image_profile) {
              setProfileImage(res.data.image_profile);
            }
          }
        } catch (error) {
          console.error("Error fetching school name:", error);
        }
      };
      fetchSchoolName();
    }
  }, [user]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const normalizedPath = imagePath.replace(/\\/g, '/');
    const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
    return `http://localhost:8081/${relativePath}`;
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  if (loading || !user) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="relative font-kantumruy">
      {/* Navbar */}
      <nav className="bg-primary px-8 py-3 shadow-sm z-50 relative">
        <div className="flex justify-between items-center">
          {/* School Name */}
          <div className="flex items-center gap-3">
            <School className="text-white" size={32} />
            <h1 className="text-white font-bold text-2xl md:text-3xl font-kantumruy">
              {schoolName}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* User Profile */}
            <div className="relative">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 text-white hover:bg-indigo-600/50 px-2 py-1 rounded-lg transition-colors duration-200"
              >
                {/* Profile Image in Navbar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-indigo-400 flex items-center justify-center">
                  {profileImage ? (
                    <img
                      src={getImageUrl(profileImage)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${profileImage ? 'hidden' : ''}`}>
                    <User className="text-white" size={20} />
                  </div>
                </div>
                
                {/* User Info */}
                <div className="text-left hidden md:block">
                  <p className="font-medium text-sm text-white">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-indigo-200">{user.role_name}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden font-kantumruy animate-in fade-in zoom-in duration-200 origin-top-right">
                  {/* Dropdown Header with Profile Image */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shrink-0 shadow-sm bg-gray-100 flex items-center justify-center">
                        {profileImage ? (
                          <img
                            src={getImageUrl(profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${profileImage ? 'hidden' : ''}`}>
                          <User className="text-gray-400" size={24} />
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-gray-800 truncate">{user.last_name} {user.first_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button 
                      onClick={() => {
                        const role = user?.role_name?.toLowerCase();
                        if (role === 'teacher') {
                          navigate('/teacher/profile');
                        } else if (role === 'principal') {
                          navigate('/principal/profile');
                        } else if (role === 'admin') {
                          navigate('/admin/profile');
                        }
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 group"
                    >
                      <CircleUser size={18} className="text-gray-400 group-hover:text-indigo-500" />
                      <span className="text-sm font-medium">ព័ត៌មានផ្ទាល់ខ្លួន</span>
                    </button>
                    <button 
                      onClick={() => {
                        const role = user?.role_name?.toLowerCase();
                        if (role === 'teacher') {
                          navigate('/teacher/change-password');
                        } else if (role === 'principal') {
                          navigate('/principal/change-password');
                        } else if (role === 'admin') {
                          navigate('/admin/change-password');
                        }
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 group"
                    >
                      <Key size={18} className="text-gray-400 group-hover:text-indigo-500" />
                      <span className="text-sm font-medium">ផ្លាស់លេខកូដ</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 p-2">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-bold">ចាកចេញ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-white hover:bg-indigo-600/50 rounded-full transition-colors duration-200"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border-2 border-primary">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden font-kantumruy animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">ការជូនដំណឹង</h3>
                    {unreadCount > 0 && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{unreadCount} ថ្មី</span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-indigo-50/40' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <p className={`text-sm mb-1 ${notification.unread ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-400">{notification.time}</p>
                            </div>
                            {notification.unread && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0"></div>
                            )}
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">គ្មានការជូនដំណឹងទេ</p>
                        </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button className="w-full py-2 text-center text-indigo-600 text-sm font-bold hover:bg-indigo-50 rounded-lg transition-colors">
                      មើលទាំងអស់
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay to close dropdowns when clicking outside */}
      {(isProfileOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Navbar;