import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, Eye, Edit, MapPin, Phone, School, User, Filter, Trash2 } from 'lucide-react';
import { request } from "./../../util/request"
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const SchoolsPageAdmin = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('សាលាកំពុងដំណើរការ');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const getListSchool = async () => {
      try {
        setLoading(true);
        setError(null);
        const schoolsData = await request("/schools", "GET");
        if (schoolsData.data && Array.isArray(schoolsData.data.data)) {
          setSchools(schoolsData.data.data);
        } else {
          setSchools(schoolsData.data || []);
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching schools:", err);
      } finally {
        setLoading(false);
      }
    };

    getListSchool();
  }, []);

  useEffect(() => {
    let currentSchools = [...schools];

    if (selectedFilter === 'សាលាកំពុងដំណើរការ') {
      currentSchools = currentSchools.filter(school => school.status === 'active');
    } else if (selectedFilter === 'សាលាបិទ') {
      currentSchools = currentSchools.filter(school => school.status === 'inactive');
    }

    if (searchQuery) {
      currentSchools = currentSchools.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSchools(currentSchools);
  }, [schools, searchQuery, selectedFilter]);


  const filters = [
    'សាលាកំពុងដំណើរការ',
    'សាលាទាំងអស់',
    'សាលាបិទ'
  ];

  const getStatusText = (status) => {
    return status === 'active' ? 'សកម្ម' : 'អសកម្ម';
  };

  const handleDelete = async (id) => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបសាលានេះមែនទេ?")) {
      try {
        await request(`/schools/${id}`, 'DELETE');
        setSchools(prev => prev.filter(school => school.id !== id));
        toast.success("លុបសាលាបានជោគជ័យ");
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "បរាជ័យក្នុងការលុបសាលា");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-kantumruy">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <School className="w-6 h-6" />
              </span>
              គ្រប់គ្រងសាលារៀន
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              មើលនិងគ្រប់គ្រងសាលារៀនទាំងអស់នៅក្នុងប្រព័ន្ធ
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/schools/create')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-sm hover:shadow-md"
            >
              <Plus size={20} />
              <span>បន្ថែមសាលា</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
           <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះសាលា..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-between gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm min-w-[200px]"
            >
              <div className="flex items-center gap-2">
                 <Filter size={18} className="text-gray-400" />
                 <span>{selectedFilter}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 flex items-center gap-2 ${
                      selectedFilter === filter ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {selectedFilter === filter && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* School Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
             <p className="text-gray-500 font-medium">កំពុងផ្ទុកសាលារៀន...</p>
          </div>
        ) : error ? (
           <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100 text-red-600">
              <p className="font-bold">Error:</p>
              <p>{error.message}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden flex flex-col h-full"
              >
                {/* School Image Cover */}
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={getImageUrl(school.cover) || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop'}
                    alt={school.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                     <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${
                        school.status === 'active' 
                           ? 'bg-emerald-500/90 text-white border-emerald-400' 
                           : 'bg-red-500/90 text-white border-red-400'
                     }`}>
                        {getStatusText(school.status)}
                     </span>
                  </div>
                </div>

                {/* School Info Body */}
                <div className="relative pt-12 px-6 pb-6 flex-1 flex flex-col">
                  
                  {/* Logo - Fixed Positioning: Absolute relative to the body content */}
                  <div className="absolute -top-10 right-6 p-1 bg-white rounded-full shadow-md border border-gray-100">
                    <img
                      src={getImageUrl(school.logo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=4F46E5&color=fff`}
                      alt="Logo"
                      className="w-20 h-20 rounded-full object-cover bg-gray-50 border border-gray-50"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                     {school.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-1 flex items-center gap-1">
                     <User size={12} /> នាយក: {school.director_name || 'N/A'}
                  </p>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="line-clamp-2 text-xs leading-relaxed">{school.address || 'មិនមានអាសយដ្ឋាន'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-medium">{school.phone_number || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
                    <button 
                      onClick={() => navigate(`/admin/schools/view/${school.id}`)}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} /> មើលលម្អិត
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/schools/update/${school.id}`)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="កែសម្រួល"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(school.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="លុប"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overlay for filter dropdown */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsFilterOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SchoolsPageAdmin;