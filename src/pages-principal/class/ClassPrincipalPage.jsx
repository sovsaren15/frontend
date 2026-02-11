import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  Filter,
  Users,
  ChevronRight,
  MoreVertical,
  Download,
  SortAsc,
  UserPlus,
  Target,
  TrendingUp,
  Award,
  X,
  Eye,
  CalendarCheck,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { request } from "./../../util/request"

const ClassPrincipalPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  // State to hold the principal's school ID
  const [principalSchoolId, setPrincipalSchoolId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (!event.target.closest('.action-menu-container')) {
        setActiveActionId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect to fetch the principal's school ID
  useEffect(() => {
    const fetchPrincipalData = async () => {
      try {
        const response = await request("/principals/me", "GET");
        if (response.data && response.data.school_id) {
          setPrincipalSchoolId(response.data.school_id);
        } else {
          setError("Could not determine principal's school ID.");
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch principal school ID.');
        console.error("Error fetching principal school ID:", err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      }
    };

    if (!principalSchoolId) {
      fetchPrincipalData();
    }
  }, [navigate, principalSchoolId]);

  const fetchClasses = useCallback(async () => {
    if (!principalSchoolId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await request(`/classes/school/${principalSchoolId}`, "GET");
      setClasses(response.data.data);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      console.error("Error fetching classes:", err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, principalSchoolId]);

  useEffect(() => {
    if (principalSchoolId) {
      fetchClasses();
    }
  }, [fetchClasses, principalSchoolId]);

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('km-KH');
  };

  const getClassStatus = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (today < start) return 'upcoming';
    if (today > end) return 'completed';
    return 'ongoing';
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'upcoming': return 'នឹងចាប់ផ្តើម';
      case 'completed': return 'បានបញ្ចប់';
      case 'ongoing': return 'កំពុងសិក្សា';
      default: return status;
    }
  };

  const statusStyles = {
    ongoing:   { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    upcoming:  { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' },
  };

  const academicYears = [...new Set(classes.map(cls => cls.academic_year).filter(Boolean))];

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.teacher_names && cls.teacher_names.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = filterYear === 'all' || cls.academic_year === filterYear;
    return matchesSearch && matchesYear;
  });

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("តើអ្នកប្រាកដទេថាចង់លុបថ្នាក់នេះ? ការលុបនេះនឹងលុបកាលវិភាគដែលពាក់ព័ន្ធទាំងអស់។")) {
      return;
    }
    try {
      await request(`/classes/${classId}`, 'DELETE');
      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      alert(err.response?.data?.message || 'បរាជ័យក្នុងការលុបថ្នាក់');
    }
  };

  const stats = {
    total: filteredClasses.length,
    ongoing: filteredClasses.filter(cls => getClassStatus(cls.start_date, cls.end_date) === 'ongoing').length,
    upcoming: filteredClasses.filter(cls => getClassStatus(cls.start_date, cls.end_date) === 'upcoming').length,
    completed: filteredClasses.filter(cls => getClassStatus(cls.start_date, cls.end_date) === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4 font-kantumruy">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">កំពុងផ្ទុកទិន្នន័យថ្នាក់</h3>
          <p className="text-slate-500 text-sm">សូមរង់ចាំបន្តិច...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center p-4 font-kantumruy">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-100 p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">បញ្ហាក្នុងការតភ្ជាប់</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchClasses}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            ព្យាយាមម្តងទៀត <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 lg:p-8 font-kantumruy">
      <div className=" mx-auto space-y-6">
        
        {/* Header */}
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/80 p-6">
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-200/30 via-transparent to-transparent blur-3xl" />
          </div>
          
          <div className="flex flex-col xl:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">គ្រប់គ្រងថ្នាក់រៀន</h1>
                <p className="text-slate-500 text-xs mt-0.5">មើលនិងគ្រប់គ្រងថ្នាក់រៀនទាំងអស់</p>
              </div>
            </div>

            <div className="flex-1 w-full max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-white/40 rounded-xl placeholder-slate-500 text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                placeholder="ស្វែងរកតាមឈ្មោះថ្នាក់ "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => navigate('/principal/classes/create')} 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>បង្កើតថ្នាក់</span>
              </button>

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm ${
                    showFilters
                      ? 'bg-indigo-600 text-white shadow-indigo-200'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-50 animate-slideDown">
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">ឆ្នាំសិក្សា</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setFilterYear('all');
                          setShowFilters(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full text-left ${
                          filterYear === 'all'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        បង្ហាញទាំងអស់
                      </button>
                      {academicYears.map(year => (
                        <button
                          key={year}
                          onClick={() => {
                            setFilterYear(year);
                            setShowFilters(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all w-full text-left ${
                            filterYear === year
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {filteredClasses.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Target}      label="សរុប"     value={stats.total}     bg="bg-white"  border="border-slate-200" text="text-slate-700"   iconBg="bg-slate-100" />
            <StatCard icon={TrendingUp}  label="កំពុងសិក្សា"   value={stats.ongoing}   bg="bg-emerald-50/50" border="border-emerald-100" text="text-emerald-700" iconBg="bg-emerald-100" />
            <StatCard icon={Award}       label="នឹងចាប់ផ្តើម"  value={stats.upcoming}  bg="bg-sky-50/50"     border="border-sky-100"     text="text-sky-700"     iconBg="bg-sky-100" />
            <StatCard icon={BookOpen}    label="បានបញ្ចប់" value={stats.completed} bg="bg-slate-50/50"   border="border-slate-200"   text="text-slate-500"   iconBg="bg-slate-200" />
          </div>
        )}

        {/* Classes List */}
        {filteredClasses.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-t-2xl">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">ឈ្មោះថ្នាក់</div>
              <div className="col-span-2 text-center">ឆ្នាំសិក្សា</div>
              <div className="col-span-2">កាលវិភាគ</div>
              <div className="col-span-2 text-center">ស្ថានភាព</div>
              <div className="col-span-1 text-center mr-4">សកម្មភាព</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredClasses.map((cls, index) => {
                const status = getClassStatus(cls.start_date, cls.end_date);
                const style = statusStyles[status] || statusStyles.completed;
                
                return (
                  <div 
                    key={cls.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors group ${activeActionId === cls.id ? 'relative z-20' : ''}`}
                  >
                    <div className="col-span-1 text-center text-sm font-medium text-slate-400">
                      {index + 1}
                    </div>

                    <div className="col-span-4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <BookOpen size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {cls.name}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                        {cls.academic_year || 'N/A'}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <div className="flex flex-col text-xs text-slate-600">
                        <span className="font-medium flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400"/>
                          {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                        </span>
                        <span className="text-slate-400 mt-0.5">
                          {formatDate(cls.start_date)} - {formatDate(cls.end_date)}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.border} ${style.bg} ${style.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    <div className="col-span-1 flex justify-center relative mr-9 action-menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveActionId(activeActionId === cls.id ? null : cls.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${activeActionId === cls.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                      >
                        <MoreVertical size={20} />
                      </button>

                      {activeActionId === cls.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-slideDown origin-top-right">
                          <button
                            onClick={() => navigate(`/principal/classes/view/${cls.id}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors text-left"
                          >
                            <Eye size={16} />
                            មើលលម្អិត
                          </button>
                          <button
                            onClick={() => navigate(`/principal/classes/update/${cls.id}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                          >
                            <Edit size={16} />
                            កែសម្រួល
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors text-left"
                          >
                            <Trash2 size={16} />
                            លុប
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {searchTerm || filterYear !== 'all' ? 'រកមិនឃើញថ្នាក់' : 'មិនមានថ្នាក់ត្រូវបានបង្កើត'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              {searchTerm 
                ? `រកមិនឃើញថ្នាក់ដែលត្រូវនឹង "${searchTerm}"។`
                : "សូមបង្កើតថ្នាក់ថ្មីដើម្បីចាប់ផ្តើម។"
              }
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilterYear('all'); fetchClasses(); }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
            >
              ផ្ទុកទិន្នន័យឡើងវិញ
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-red-600 bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-sm"
          >
            បោះបង់
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, bg, border, text, iconBg }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4`}>
      <div className={`${iconBg} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${text}`} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default ClassPrincipalPage;