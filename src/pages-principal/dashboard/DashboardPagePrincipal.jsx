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
} from 'lucide-react';
import { request } from "./../../util/request"
import { useNavigate } from 'react-router-dom';

const DashboardPagePrincipal = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request("/principals/dashboard", "GET");
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
  
  const StatCard = ({ icon: Icon, title, value, color, gradient }) => (
    <div className="group relative  rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-4xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {value || 0}
          </p>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`h-1 ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </div>
  );

  const EventCard = ({ event, index }) => (
    <div 
      className="group  from-white to-gray-50 rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
            {event.title}
          </h4>
          <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 animate-ping mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Loading your dashboard...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center gap-3 text-red-600 mb-6">
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold">Error Loading Dashboard</h3>
          </div>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-100">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-6">
            <School className="w-20 h-20 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No School Assigned</h3>
          <p className="text-gray-600 leading-relaxed">
            You are not currently assigned to any school. Please contact your administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            {school.logo && (
              <div className="relative group">
                <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img 
                  src={school.logo} 
                  alt={school.name}
                  className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {school.name}
              </h1>
              {school.address && (
                <p className="text-blue-100 text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  {school.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Message */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h2>
          <p className="text-gray-600">Here's what's happening at your school today.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard
            icon={Users}
            title="Total Teachers"
            value={stats.total_teachers}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={GraduationCap}
            title="Total Students"
            value={stats.total_students}
            color="bg-gradient-to-br from-green-500 to-green-600"
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={BookOpen}
            title="Total Classes"
            value={stats.total_classes}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recent Events</h2>
              <p className="text-gray-600">Stay updated with upcoming activities</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
          
          {recent_events && recent_events.length > 0 ? (
            <div className="space-y-4">
              {recent_events.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl inline-block mb-4">
                <Calendar className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No recent events found</p>
              <p className="text-gray-400 text-sm mt-2">Check back later for updates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPagePrincipal;