import { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  School,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Award,
  Users,
} from 'lucide-react';
import {request} from "../util/request"
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../component/layout/AuthContext';

const DashboardPageTeacher = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request("/teachers/dashboard", "GET");
      setDashboardData(response.data);
      console.log("Fetched dashboard data:", response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setError(err.message || 'An unexpected error occurred.');
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const StatCard = ({ icon: Icon, title, value, gradient, iconBg, delay = 0 }) => (
    <div 
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
      style={{ 
        animation: `slideUp 0.6s ease-out ${delay}ms both`,
      }}
    >
      {/* Animated gradient background on hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      {/* Decorative circle */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 ${gradient} rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700`}></div>
      
      {/* Content */}
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div className={`${iconBg} p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span>Active</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-3">
            {title}
          </p>
          <p className={`text-5xl font-extrabold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
            {value || 0}
          </p>
        </div>
      </div>
      
      {/* Bottom shine effect */}
      <div className={`h-1.5 ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
    </div>
  );

  const EventCard = ({ event, index }) => (
    <div 
      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-indigo-200 overflow-hidden"
      style={{ animation: `fadeIn 0.5s ease-out ${index * 100}ms both` }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
      
      <div className="relative flex items-start gap-5">
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h4 className="font-bold text-gray-900 text-xl group-hover:text-indigo-600 transition-colors duration-300">
              {event.title}
            </h4>
            <ArrowRight className="w-6 h-6 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full font-medium">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              {new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-purple-600 animate-ping mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-gray-800 font-bold text-2xl mb-2">Loading Your Dashboard</p>
          <p className="text-gray-600 text-lg">Preparing your teaching space...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full border border-red-100">
          <div className="flex items-center gap-4 text-red-600 mb-6">
            <div className="bg-red-100 p-4 rounded-2xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">Connection Error</h3>
          </div>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 px-6 rounded-2xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border border-gray-100">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-3xl inline-block mb-6">
            <School className="w-24 h-24 text-gray-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">No School Assignment</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            You haven't been assigned to a school yet. Please reach out to your administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-6">
            {school.logo && (
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <img 
                  src={school.logo} 
                  alt={school.name}
                  className="relative w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8 text-yellow-300" style={{ animation: 'float 3s ease-in-out infinite' }} />
                <span className="text-white/90 text-lg font-semibold bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
                  Teacher Portal
                </span>
              </div>
              <h1 className="text-5xl font-black text-white mb-3 drop-shadow-2xl tracking-tight">
                {school.name}
              </h1>
              {school.address && (
                <p className="text-indigo-100 text-lg flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-pink-300 rounded-full animate-pulse"></span>
                  {school.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="mb-10" style={{ animation: 'slideUp 0.6s ease-out' }}>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3 flex items-center gap-3" >
            <span>Welcome Back, {user?.first_name}!</span>
            <span className="text-5xl" style={{ animation: 'float 2s ease-in-out infinite' }}>👋</span>
          </h2>
          <p className="text-gray-600 text-xl">Here's an overview of your classes and upcoming events.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <StatCard
            icon={GraduationCap}
            title="My Students"
            value={stats.total_students}
            gradient="from-indigo-500 to-purple-600"
            iconBg="bg-gradient-to-br from-indigo-500 to-purple-600"
            delay={0}
          />
          <StatCard
            icon={BookOpen}
            title="Total Classes"
            value={stats.total_classes}
            gradient="from-purple-500 to-pink-600"
            iconBg="bg-gradient-to-br from-purple-500 to-pink-600"
            delay={100}
          />
        </div>

        {/* Recent Events */}
        <div 
          className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 relative overflow-hidden"
          style={{ animation: 'slideUp 0.6s ease-out 200ms both' }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-3 flex items-center gap-3">
                  <Sparkles className="w-10 h-10 text-indigo-600" />
                  Upcoming Events
                </h2>
                <p className="text-gray-600 text-lg">Stay informed about what's happening</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-5 rounded-2xl shadow-xl" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <Calendar className="w-9 h-9 text-white" />
              </div>
            </div>
            
            {recent_events && recent_events.length > 0 ? (
              <div className="space-y-5">
                {recent_events.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-10 rounded-3xl inline-block mb-6">
                  <Calendar className="w-20 h-20 text-gray-400" />
                </div>
                <p className="text-gray-600 text-2xl font-bold mb-2">No Events Scheduled</p>
                <p className="text-gray-500 text-lg">Check back later for new updates</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageTeacher;