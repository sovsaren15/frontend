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
  const [performanceData, setPerformanceData] = useState(null);
  const [newStudentData, setNewStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch Main Dashboard Data
      const response = await request("/principals/dashboard", "GET");
      setDashboardData(response.data);

      // 2. Fetch Score/Performance Data separately
      if (response.data?.school?.id) {
        try {
          // The report endpoint likely requires a period to filter scores.
          // Let's default to 'Semester 1' as a potential fix for the 500 error.
          // This should ideally be dynamic or selectable by the user in the future.
          const academicPeriodName = 'Semester 1';
          const year = new Date().getFullYear();
          // The backend likely expects a single academic_period string, e.g., "2024-Semester 1"
          const fullAcademicPeriod = `${year}-${academicPeriodName}`;
          const perfResponse = await request(`/scores/report?school_id=${response.data.school.id}&academic_period=${fullAcademicPeriod}&period_type=semester&year=${year}`, "GET");
          const stats = perfResponse.data?.stats || { passed: 0, failed: 0 };
          
          const total = (stats.passed || 0) + (stats.failed || 0);
          
          if (total > 0) {
            const passPercent = Math.round((stats.passed / total) * 100);
            setPerformanceData([
              { name: 'ជាប់', value: passPercent },
              { name: 'ធ្លាក់', value: 100 - passPercent },
            ]);
          } else {
            // Default if no scores exist yet
            setPerformanceData([
              { name: 'ជាប់', value: 0 },
              { name: 'ធ្លាក់', value: 0 },
            ]);
          }
        } catch (perfError) {
          console.error("Could not load performance data", perfError);
          // Set empty state on error so it doesn't load forever
          setPerformanceData([
            { name: 'ជាប់', value: 0 },
            { name: 'ធ្លាក់', value: 0 },
          ]);
        }
      }
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

  // Custom Simple Chart Components
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
    // Check if data is available, otherwise show placeholder
    if (!data || data.length === 0) {
      return <div className="h-full flex items-center justify-center text-gray-400">កំពុងទាញយកទិន្នន័យ...</div>;
    }

    const passPercentage = data[0].value;
    const isNoData = data[0].value === 0 && data[1].value === 0;
    
    return (
      <div className="h-full flex items-center justify-center relative">
         <div 
            className="relative w-40 h-40 rounded-full overflow-hidden" 
            style={{ 
                background: isNoData 
                    ? '#E5E7EB' // Gray if no data
                    : `conic-gradient(#10B981 0% ${passPercentage}%, #EF4444 ${passPercentage}% 100%)` 
            }}
         >
           <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex items-center justify-center flex-col">
             {isNoData ? (
                 <span className="text-sm text-gray-400 font-medium">គ្មានទិន្នន័យ</span>
             ) : (
                 <>
                    <span className="text-3xl font-bold text-gray-800">{passPercentage}%</span>
                    <span className="text-sm text-gray-500 font-medium">ជាប់</span>
                 </>
             )}
           </div>
         </div>
         
         <div className="absolute bottom-0 right-0 flex flex-col gap-2 text-xs bg-white/90 p-3 rounded-xl border border-gray-100 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                <span className="font-medium text-gray-600">ជាប់</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
                <span className="font-medium text-gray-600">ធ្លាក់</span>
            </div>
         </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">កំពុងដំណើរការ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
            <School className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">មិនមានសាលារៀន</h3>
          <p className="text-gray-600 text-sm">
            សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធរបស់អ្នក។
          </p>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  const attendanceData = [
    { name: 'ច័ន្ទ', present: 92 },
    { name: 'អង្គារ', present: 95 },
    { name: 'ពុធ', present: 88 },
    { name: 'ព្រហស្បតិ៍', present: 94 },
    { name: 'សុក្រ', present: 90 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 font-kantumruy">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {school.logo ? (
              <img 
                src={school.logo} 
                alt={school.name}
                className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
              />
            ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <School className="w-8 h-8 text-indigo-500" />
                </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {school.name}
              </h1>
              {school.address && (
                <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                  <span className="truncate max-w-[300px]">{school.address}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={Users}
            title="គ្រូបង្រៀនសរុប"
            value={stats.total_teachers}
            color="bg-blue-600"
          />
          <StatCard
            icon={GraduationCap}
            title="សិស្សសរុប"
            value={stats.total_students}
            color="bg-emerald-600"
          />
          <StatCard
            icon={BookOpen}
            title="ថ្នាក់រៀនសរុប"
            value={stats.total_classes}
            color="bg-purple-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* New Students Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">សិស្សថ្មីប្រចាំខែ</h3>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{filters.year}</span>
            </div>
            <div className="h-64">
              <SimpleBarChart data={newStudentData} dataKey="students" labelKey="name" color="bg-indigo-500" />
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">វត្តមានសិស្សប្រចាំសប្តាហ៍</h3>
                <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">មធ្យម 91%</span>
            </div>
            <div className="h-64">
              <SimpleAreaChart data={attendanceData} dataKey="present" labelKey="name" colorHex="#10B981" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* Academic Performance */}
           <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
             <h3 className="text-lg font-bold text-gray-900 mb-6">លទ្ធផលសិក្សា</h3>
             <div className="flex-1 min-h-[250px]">
               <SimplePieChart data={performanceData} />
             </div>
           </div>

           {/* Recent Events */}
           <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <h2 className="text-lg font-bold text-gray-900">ព្រឹត្តិការណ៍ថ្មីៗ</h2>
                 <p className="text-gray-500 text-sm mt-0.5">សកម្មភាពដែលនឹងមកដល់ឆាប់ៗនេះ</p>
               </div>
               <button onClick={() => navigate('/principal/events')} className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold hover:underline">
                 មើលទាំងអស់
               </button>
             </div>
             
             {recent_events && recent_events.length > 0 ? (
               <div className="space-y-3">
                 {recent_events.map((event, index) => (
                   <EventCard key={event.id} event={event} index={index} />
                 ))}
               </div>
             ) : (
               <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                 <div className="bg-white p-3 rounded-full inline-block mb-3 shadow-sm">
                   <Calendar className="w-6 h-6 text-gray-400" />
                 </div>
                 <p className="text-gray-900 font-medium">មិនមានព្រឹត្តិការណ៍ទេ</p>
                 <p className="text-gray-500 text-sm mt-1">សូមត្រឡប់មកពិនិត្យម្តងទៀតនៅពេលក្រោយ</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPagePrincipal;