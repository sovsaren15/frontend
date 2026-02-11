import { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  AlertCircle,
  School,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  CalendarCheck,
  FileText,
  BarChart3,
  Clock,
  ChevronRight,
  Bell,
  Home,
} from 'lucide-react';
import { request } from "../util/request";
import { useNavigate } from 'react-router-dom';
// Ensure you have this context or remove if not needed
// import { useAuth } from '../component/layout/AuthContext'; 

const StatCard = ({ icon: Icon, title, value, color = 'indigo', delay = 0 }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100', border: 'border-indigo-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100', border: 'border-purple-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700', iconBg: 'bg-pink-100', border: 'border-pink-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', border: 'border-blue-100' },
  };
  
  const selected = colors[color] || colors.indigo;
  
  return (
    <div 
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${selected.iconBg}`}>
            <Icon className="w-6 h-6" style={{ color: `var(--color-${color}-600)` }} />
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>សកម្ម</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-bold text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, path, color = 'indigo', delay }) => {
  const navigate = useNavigate();
  const colors = {
    indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-600' },
    blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600' },
  };
  
  const selected = colors[color] || colors.indigo;
  
  return (
    <button
      onClick={() => navigate(path)}
      className={`relative bg-white p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 text-left group w-full ${selected.hover}`}
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}
    >
      <div className={`p-3 rounded-lg ${selected.bg} w-fit mb-4 group-hover:scale-105 transition-transform duration-300`}>
        <Icon className="w-6 h-6" style={{ color: `var(--color-${color}-600)` }} />
      </div>
      
      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-gray-800 transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      
      <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
        ចូលប្រើ
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const EventCard = ({ event, index }) => (
  <div 
    className="relative bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 group"
    style={{ animation: `fadeInUp 0.4s ease-out ${index * 50}ms both` }}
  >
    <div className="p-5">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-50 p-3 rounded-lg">
          <Calendar className="w-5 h-5 text-indigo-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
              {event.title}
            </h4>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-0.5" />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(event.date).toLocaleDateString('km-KH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DashboardPageTeacher = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mocking user for display if AuthContext is missing, replace with your actual hook
  // const { user } = useAuth(); 
  const user = JSON.parse(localStorage.getItem('user')) || { first_name: 'គ្រូ' };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request("/teachers/dashboard", "GET");
      setDashboardData(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setError(err.message || 'មានកំហុសមិនរំពឹងទុកមួយបានកើតឡើង។');
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-kantumruy">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-1">កំពុងផ្ទុកផ្ទាំងគ្រប់គ្រង</p>
          <p className="text-gray-500 text-sm">កំពុងរៀបចំកន្លែងធ្វើការរបស់អ្នក...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-kantumruy">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-6">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">កំហុសក្នុងការតភ្ជាប់</h3>
              <p className="text-red-500 text-sm mt-1">បរាជ័យក្នុងការផ្ទុកទិន្នន័យ</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          
          <button
            onClick={fetchDashboardData}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-kantumruy">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="p-4 bg-gray-50 rounded-xl inline-block mb-6">
            <School className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg mb-2">មិនទាន់មានការចាត់តាំងសាលា</h3>
          <p className="text-gray-600 text-sm mb-6">
            អ្នកមិនទាន់ត្រូវបានចាត់តាំងឱ្យទៅសាលារៀនណាមួយនៅឡើយទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រងរបស់អ្នក។
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
          >
            ត្រឡប់ទៅទំព័រដើម
          </button>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  return (
    <div className="min-h-screen  font-kantumruy">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                សូមស្វាគមន៍, {user?.first_name}!
              </h2>
              <p className="text-gray-600 text-sm">
                នេះគឺជាទិដ្ឋភាពទូទៅនៃថ្នាក់រៀន និងព្រឹត្តិការណ៍នាពេលខាងមុខរបស់អ្នក។
              </p>
            </div>
            <div className="sm:hidden">
              <div className="text-sm text-gray-500 mb-1">
                {currentTime.toLocaleDateString('km-KH', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <StatCard
              icon={Users}
              title="សិស្សសរុប"
              value={stats.total_students}
              color="indigo"
              delay={0}
            />
            <StatCard
              icon={BookOpen}
              title="ថ្នាក់សរុប"
              value={stats.total_classes}
              color="purple"
              delay={50}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-gray-900">សកម្មភាពរហ័ស</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickActionCard 
              icon={CalendarCheck}
              title="ស្រង់វត្តមាន"
              description="កត់ត្រាវត្តមានប្រចាំថ្ងៃ"
              path="/teacher/attendance"
              color="blue"
              delay={100}
            />
            <QuickActionCard 
              icon={BookOpen}
              title="ថ្នាក់រៀនរបស់ខ្ញុំ"
              description="មើល និងគ្រប់គ្រងថ្នាក់"
              path="/teacher/classes"
              color="emerald"
              delay={150}
            />
            <QuickActionCard 
              icon={FileText}
              title="ដាក់ពិន្ទុ"
              description="ដាក់ពិន្ទុសិស្ស"
              path="/teacher/scores"
              color="purple"
              delay={200}
            />
            <QuickActionCard 
              icon={BarChart3}
              title="របាយការណ៍"
              description="មើលរបាយការណ៍ និងវិភាគ"
              path="/teacher/attendance-report"
              color="indigo"
              delay={250}
            />
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900">ព្រឹត្តិការណ៍ខាងមុខ</h3>
            </div>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              មើលទាំងអស់
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              {recent_events && recent_events.length > 0 ? (
                <div className="space-y-3">
                  {recent_events.slice(0, 3).map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-50 rounded-xl inline-block mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 mb-1">មិនមានព្រឹត្តិការណ៍ខាងមុខទេ</p>
                  <p className="text-gray-500 text-sm">សូមពិនិត្យមើលម្តងទៀតនៅពេលក្រោយ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        :root {
          --color-indigo-50: #eef2ff;
          --color-indigo-100: #e0e7ff;
          --color-indigo-600: #4f46e5;
          --color-purple-50: #faf5ff;
          --color-purple-100: #f3e8ff;
          --color-purple-600: #9333ea;
          --color-pink-50: #fdf2f8;
          --color-pink-100: #fce7f3;
          --color-pink-600: #db2777;
          --color-blue-50: #eff6ff;
          --color-blue-100: #dbeafe;
          --color-blue-600: #2563eb;
          --color-emerald-50: #ecfdf5;
          --color-emerald-100: #d1fae5;
          --color-emerald-600: #059669;
        }
      `}</style>
    </div>
  );
};

export default DashboardPageTeacher;