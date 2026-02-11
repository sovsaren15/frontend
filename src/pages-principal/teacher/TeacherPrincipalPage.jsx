import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, Eye, Edit, User, Mail, Users, Phone, Calendar } from 'lucide-react';
import { request } from "./../../util/request";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') 
    ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) 
    : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const TeacherPrincipalPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTeachers = useCallback(async (schoolId, currentSearchTerm, currentStatusFilter) => {
    if (!schoolId) return;

    try {
      const response = await request(`/teachers/school/${schoolId}`, "GET", {
        params: {
          search: currentSearchTerm || '',
          status: currentStatusFilter === 'all' ? '' : currentStatusFilter,
        }
      });
      setTeachers(response.data.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setError(err.message || 'Failed to load teachers');
      console.error(err);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dashboardResponse = await request("/principals/dashboard", "GET");
        const schoolData = dashboardResponse.data;
        setDashboardData(schoolData);

        if (schoolData?.school?.id) {
          await fetchTeachers(schoolData.school.id, searchTerm, statusFilter);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        setError(err.message || 'Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate, searchTerm, statusFilter, fetchTeachers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">Loading teachers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-red-600 bg-red-50 px-8 py-6 rounded-xl border border-red-200">
          <p className="text-lg font-medium">Error</p>
          <p className="mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <Users size={64} className="mx-auto text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            No School Assigned
          </h2>
          <p className="text-gray-500 mb-6">
            You are not currently assigned to any school. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className=" mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="text-indigo-600" size={32} />
                បញ្ជីគ្រូបង្រៀន
              </h1>
              <p className="mt-2 text-gray-600">
                មើលនិងគ្រប់គ្រងព័ត៌មានគ្រូទាំងអស់ក្នុងសាលា
              </p>
            </div>
            <button
              onClick={() => navigate('/principal/teachers/create')}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 whitespace-nowrap"
            >
              <Plus size={20} />
              បន្ថែមគ្រូថ្មី
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ស្វែងរកឈ្មោះ ឬអ៊ីមែល..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-5 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            >
              <option value="all">គ្រប់ស្ថានភាព</option>
              <option value="active">សកម្ម</option>
              <option value="inactive">អសកម្ម</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Teacher Cards */}
        {teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col"
              >
                {/* Header part */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 rounded-xl bg-gray-100 border-2 border-gray-200 overflow-hidden flex-shrink-0">
                      {teacher.image_profile ? (
                        <img
                          src={getImageUrl(teacher.image_profile)}
                          alt={`${teacher.first_name} ${teacher.last_name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="text-gray-400" size={28} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            teacher.status === 'active'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {teacher.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {teacher.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>

                  {teacher.phone_number && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{teacher.phone_number}</span>
                    </div>
                  )}

                  {teacher.sex && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <User size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{teacher.sex}</span>
                    </div>
                  )}

                  {teacher.date_of_birth && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                      <span>{new Date(teacher.date_of_birth).toLocaleDateString('km-KH')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-5 border-t border-gray-100 mt-auto flex justify-end gap-3 bg-gray-50/60">
                  <button
                    onClick={() => navigate(`/principal/teachers/${teacher.id}`)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-1.5"
                  >
                    <Eye size={16} />
                    មើល
                  </button>
                  <button
                    onClick={() => navigate(`/principal/teachers/${teacher.id}`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Edit size={16} />
                    កែសម្រួល
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <Users className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              មិនមានគ្រូបង្រៀន
            </h3>
            <p className="text-gray-500 mb-8">
              មិនមានគ្រូណាមួយត្រូវនឹងលក្ខខណ្ឌស្វែងរករបស់អ្នកទេ
            </p>
            <button
              onClick={() => navigate('/principal/teachers/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              បន្ថែមគ្រូដំបូង
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherPrincipalPage;