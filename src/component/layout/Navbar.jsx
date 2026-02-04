import { useState, useEffect } from 'react';
import { Bell, ChevronDown, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "គ្រូថ្មី ៣ នាក់បានចុះឈ្មោះ", time: "២ នាទីមុន", unread: true },
    { id: 2, message: "របាយការណ៍ប្រចាំខែត្រូវបានអាប់ដេត", time: "១៥ នាទីមុន", unread: true },
    { id: 3, message: "ការប្រជុំគ្រូនឹងធ្វើនៅថ្ងៃស្អែក", time: "១ ម៉ោងមុន", unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const { user, logout, loading } = useAuth();

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
    <div className="relative">
      {/* Navbar */}
      <nav className="bg-primary px-8 py-3 shadow-sm">
        <div className="flex justify-end items-center gap-6">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 text-white hover:bg-indigo-600/50 px-2 py-1 rounded-lg transition-colors duration-200"
            >
              {/* Profile Image */}
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* User Info */}
              <div className="text-left">
                <p className="font-medium text-sm text-white">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-indigo-200">{user.role_name}</p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <User size={16} />
                    <span className="text-sm">ព័ត៌មានផ្ទាល់ខ្លួន</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <Settings size={16} />
                    <span className="text-sm">ការកំណត់គណនី</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 py-2">
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">ចាកចេញ</span>
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
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">ការជូនដំណឹង</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        notification.unread ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100">
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                    មើលការជូនដំណឹងទាំងអស់
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay to close dropdowns when clicking outside */}
      {(isProfileOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40"
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