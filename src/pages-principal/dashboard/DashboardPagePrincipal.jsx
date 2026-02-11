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
  
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
          <TrendingUp className="w-3 h-3" />
          <span>Live</span>
        </div>
      </div>
      
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">
          {title}
        </p>
        <p className="text-3xl font-semibold text-gray-900">
          {value || 0}
        </p>
      </div>
    </div>
  );

  const EventCard = ({ event, index }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors duration-200">
      <div className="flex items-start gap-4">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Calendar className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {event.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(event.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  // Custom Simple Chart Components to replace Recharts
  const SimpleBarChart = ({ data, dataKey, labelKey, color }) => {
    const max = Math.max(...data.map(d => d[dataKey])) || 1;
    return (
      <div className="flex items-end justify-between h-full gap-2 pt-8 pb-2 px-2">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative">
             <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 transition-opacity whitespace-nowrap z-10 pointer-events-none">
               {item[labelKey]}: {item[dataKey]}
             </div>
             <div 
               className={`w-full max-w-[30px] sm:max-w-[40px] rounded-t-md transition-all duration-500 ${color} hover:opacity-80`}
               style={{ height: `${(item[dataKey] / max) * 100}%` }}
             ></div>
             <span className="text-[10px] sm:text-xs text-gray-500 mt-2 truncate w-full text-center">{item[labelKey]}</span>
          </div>
        ))}
      </div>
    );
  };

  const SimpleAreaChart = ({ data, dataKey, labelKey, colorHex }) => {
    const max = 100; 
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d[dataKey] / max) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <div className="h-full w-full relative pt-4 pb-6 px-2 flex flex-col justify-end">
         <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <polygon points={`0,100 ${points} 100,100`} fill={colorHex} fillOpacity="0.1" />
            <polyline points={points} fill="none" stroke={colorHex} strokeWidth="2" vectorEffect="non-scaling-stroke" />
         </svg>
         <div className="flex justify-between mt-2 text-xs text-gray-500">
            {data.map((d, i) => <span key={i}>{d[labelKey]}</span>)}
         </div>
      </div>
    );
  };

  const SimplePieChart = ({ data }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    const passPercentage = (data[0].value / total) * 100;
    
    return (
      <div className="h-full flex items-center justify-center relative">
         <div className="relative w-40 h-40 rounded-full overflow-hidden" style={{ background: `conic-gradient(#10B981 0% ${passPercentage}%, #EF4444 ${passPercentage}% 100%)` }}>
           <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-gray-800">{data[0].value}%</span>
              <span className="text-xs text-gray-500">ជាប់</span>
           </div>
         </div>
         <div className="absolute bottom-0 right-0 flex flex-col gap-1 text-xs bg-white/80 p-2 rounded-lg backdrop-blur-sm border border-gray-100">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span>ជាប់</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>ធ្លាក់</span></div>
         </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-sm w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
          </div>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
            <School className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No School Assigned</h3>
          <p className="text-gray-600 text-sm">
            Please contact your administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  // Mock Data for Charts
  const newStudentData = [
    { name: 'មករា', students: 45 },
    { name: 'កុម្ភៈ', students: 52 },
    { name: 'មីនា', students: 38 },
    { name: 'មេសា', students: 65 },
    { name: 'ឧសភា', students: 48 },
    { name: 'មិថុនា', students: 55 },
  ];

  const attendanceData = [
    { name: 'ច័ន្ទ', present: 92 },
    { name: 'អង្គារ', present: 95 },
    { name: 'ពុធ', present: 88 },
    { name: 'ព្រហស្បតិ៍', present: 94 },
    { name: 'សុក្រ', present: 90 },
  ];

  const performanceData = [
    { name: 'ជាប់', value: 85 },
    { name: 'ធ្លាក់', value: 15 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            {school.logo && (
              <img 
                src={school.logo} 
                alt={school.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {school.name}
              </h1>
              {school.address && (
                <p className="text-gray-600 text-sm">
                  {school.address}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-gray-600">Here's what's happening at your school today.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={Users}
            title="Total Teachers"
            value={stats.total_teachers}
            color="bg-blue-600"
          />
          <StatCard
            icon={GraduationCap}
            title="Total Students"
            value={stats.total_students}
            color="bg-green-600"
          />
          <StatCard
            icon={BookOpen}
            title="Total Classes"
            value={stats.total_classes}
            color="bg-purple-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* New Students Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">សិស្សថ្មីប្រចាំខែ</h3>
            <div className="h-80">
              <SimpleBarChart data={newStudentData} dataKey="students" labelKey="name" color="bg-indigo-600" />
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">វត្តមានសិស្សប្រចាំសប្តាហ៍</h3>
            <div className="h-80">
              <SimpleAreaChart data={attendanceData} dataKey="present" labelKey="name" colorHex="#10B981" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* Academic Performance */}
           <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">លទ្ធផលសិក្សា</h3>
              <div className="h-64">
                <SimplePieChart data={performanceData} />
              </div>
           </div>

           {/* Recent Events */}
           <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent Events</h2>
                  <p className="text-gray-600 text-sm">Stay updated with upcoming activities</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              
              {recent_events && recent_events.length > 0 ? (
                <div className="space-y-3">
                  {recent_events.map((event, index) => (
                    <EventCard key={event.id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-50 p-4 rounded-full inline-block mb-3">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No recent events</p>
                  <p className="text-gray-400 text-sm mt-1">Check back later for updates</p>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPagePrincipal;