import { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  School,
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Zap,
  CalendarCheck,
  BarChart3,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { request } from "../util/request";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../component/layout/AuthContext';

// Helper function to handle image URLs consistently
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const relativePath = normalizedPath.includes("uploads/")
    ? normalizedPath.substring(normalizedPath.indexOf("uploads/"))
    : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const StatCard = ({ icon: Icon, title, value, color, delay = 0 }) => {
  const colors = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100', border: 'border-indigo-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100', border: 'border-purple-100' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-700', iconBg: 'bg-pink-100', border: 'border-pink-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', border: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', iconBg: 'bg-emerald-100', border: 'border-emerald-100' },
  };
  
  const selected = colors[color] || colors.indigo;
  
  return (
    <div 
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group overflow-hidden"
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${selected.iconBg}`}>
            <Icon className={`w-6 h-6 ${selected.text.replace('700', '600')}`} />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>សកម្ម</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value || 0}</p>
        </div>
        
        {/* Decorative background element */}
        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${selected.bg} opacity-50 group-hover:scale-110 transition-transform duration-500`} />
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
      className={`relative bg-white p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 text-left group w-full hover:shadow-sm`}
      style={{ animation: `fadeInUp 0.4s ease-out ${delay}ms both` }}
    >
      <div className={`p-3 rounded-xl ${selected.bg} w-fit mb-4 group-hover:scale-110 transition-transform duration-300 ${selected.hover}`}>
        <Icon className={`w-6 h-6 ${selected.text}`} />
      </div>
      
      <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{description}</p>
      
      <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-indigo-600 transition-colors">
        ចូលប្រើ
        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  let displayImage = null;

  if (event.image) {
    try {
      const parsed = typeof event.image === "string" ? JSON.parse(event.image) : event.image;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayImage = parsed[0];
      } else if (typeof parsed === "string") {
        displayImage = parsed;
      }
    } catch (e) {
      if (typeof event.image === "string") displayImage = event.image;
    }
  }

  return (
    <div 
      onClick={() => navigate(`/teacher/events/viewdetail/${event.id}`)}
      className="bg-white rounded-xl border border-gray-100 p-3 hover:border-indigo-200 hover:shadow-md transition-all duration-200 cursor-pointer group flex gap-4 items-start"
    >
      {/* Date Box / Image */}
      <div className="shrink-0 relative">
        {displayImage ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100">
            <img
              src={getImageUrl(displayImage)}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 border border-indigo-100">
            <span className="text-xs font-bold uppercase">
              {new Date(event.date || event.start_date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="text-2xl font-bold">
              {new Date(event.date || event.start_date).getDate()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors mb-1 text-base">
          {event.title}
        </h4>
        
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            {new Date(event.date || event.start_date).toLocaleDateString("km-KH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          
          {event.location && (
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span className="truncate">{event.location}</span>
            </p>
          )}
        </div>
      </div>
      
      <div className="self-center p-2 text-gray-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 rounded-full transition-all">
        <ArrowRight className="w-5 h-5" />
      </div>
    </div>
  );
};

const DashboardPageTeacher = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { user } = useAuth();

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
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium animate-pulse">កំពុងផ្ទុកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-kantumruy">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8  w-full text-center">
          <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</h3>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
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
          <div className="bg-indigo-50 p-4 rounded-full inline-block mb-4">
            <School className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">មិនទាន់មានការចាត់តាំងសាលា</h3>
          <p className="text-gray-500 mb-6 text-sm">សូមទាក់ទងអ្នកគ្រប់គ្រងរបស់អ្នកដើម្បីទទួលបានសិទ្ធិ។</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            ត្រឡប់ទៅទំព័រដើម
          </button>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  return (
    <div className="min-h-screen  font-kantumruy pb-12">

      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              សួស្តី, {user?.last_name} {user?.first_name}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              ស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រងការងារបង្រៀនរបស់អ្នក
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                {currentTime.toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm font-bold text-gray-900 leading-none">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title="សិស្សសរុប"
            value={stats.total_students}
            color="indigo"
            delay={0}
          />
          <StatCard
            icon={BookOpen}
            title="ថ្នាក់ទទួលបន្ទុក"
            value={stats.total_classes}
            color="emerald"
            delay={50}
          />
          {/* Add more stats if available in API, placeholders for layout */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group">
             <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">កត់ត្រាវត្តមានថ្ងៃនេះ?</h3>
                <p className="text-indigo-100 text-sm mb-4 max-w-xs">កុំភ្លេចស្រង់វត្តមានសិស្សសម្រាប់ថ្នាក់រៀនរបស់អ្នកនៅថ្ងៃនេះ។</p>
                <button 
                  onClick={() => navigate('/teacher/attendance')}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors inline-flex items-center gap-2"
                >
                  <CalendarCheck size={16} />
                  ស្រង់វត្តមានឥឡូវនេះ
                </button>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>
             <div className="absolute bottom-0 right-10 w-24 h-24 bg-indigo-400 opacity-20 rounded-full transform translate-y-10 group-hover:scale-110 transition-transform duration-500"></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            <h3 className="font-bold text-gray-900 text-lg">សកម្មភាពរហ័ស</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Recent Events & Calendar or Other widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Events Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    ព្រឹត្តិការណ៍ថ្មីៗ
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    សកម្មភាពដែលនឹងមកដល់ឆាប់ៗនេះ
                  </p>
                </div>
                <button
                  onClick={() => navigate("/teacher/events")}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-bold hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  មើលទាំងអស់
                </button>
              </div>

              {recent_events && recent_events.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {recent_events.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                    <Calendar className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-medium">មិនមានព្រឹត្តិការណ៍ទេ</p>
                  <p className="text-gray-500 text-sm mt-1">
                    សូមត្រឡប់មកពិនិត្យម្តងទៀតនៅពេលក្រោយ
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Side Widget (Example: Upcoming Holidays or simple calendar visual) */}
          <div className="lg:col-span-1">
             <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm h-full flex flex-col">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-indigo-500" />
                   ប្រតិទិន
                </h3>
                {/* Simple Calendar Placeholder - typically you'd use a calendar lib here */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
                   <div className="text-center font-bold text-gray-800 mb-2">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                   </div>
                   <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                      <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                   </div>
                   <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600">
                      {/* Mock days */}
                      {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                         <div key={d} className={`p-1.5 rounded-lg ${d === new Date().getDate() ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-50'}`}>
                            {d}
                         </div>
                      ))}
                   </div>
                </div>
                <div className="mt-auto">
                   <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <h4 className="font-bold text-blue-800 text-sm mb-1">ជំនួយការគ្រូបង្រៀន</h4>
                      <p className="text-xs text-blue-600 leading-relaxed">
                         ត្រូវការជំនួយក្នុងការប្រើប្រាស់ប្រព័ន្ធ? ទាក់ទងផ្នែក IT ឬមើលសៀវភៅណែនាំ។
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPageTeacher;