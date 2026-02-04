import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, Eye, Edit, MapPin, Phone } from 'lucide-react';
import {request} from "./../../util/request"

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
        setSchools(schoolsData.data || []); // The API returns { success: true, data: [...] }
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

    // Filter by status based on selectedFilter
    if (selectedFilter === 'សាលាកំពុងដំណើរការ') {
      currentSchools = currentSchools.filter(school => school.status === 'active');
    } else if (selectedFilter === 'សាលាបិទ') {
      currentSchools = currentSchools.filter(school => school.status === 'inactive');
    }
    // 'សាលាទាំងអស់' shows all schools, so no status filter is needed.

    // Filter by search query on name
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

  return (
    <div className="min-h-screen  p-4 sm:p-6 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        {/* Search Bar */}
        <div className="w-full md:flex-1 md:max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary transition-colors duration-200"
          />
        </div>

        {/* Filter Dropdown and Add New Button Group */}
        <div className="flex items-center justify-end gap-4">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-between gap-1 px-6 py-3 bg-white border-2 border-primary text-primary rounded-full font-medium hover:bg-indigo-50 transition-colors duration-200"
            >
              <span>{selectedFilter}</span>
              <ChevronDown className="" size={20} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      selectedFilter === filter ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add New Button */}
          <button
            onClick={() => navigate('/admin/schools/create')}
            className="flex items-center gap-1 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
          >
            <Plus size={20} />
            <span>បន្ថែមសាលា</span>
          </button>
        </div>
      </div>

      {/* School Cards Grid */}
      {loading && <div className="text-center p-8">Loading schools...</div>}
      {error && <div className="text-center p-8 text-red-500">Error: {error.message}</div>}
      {!loading && !error && (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <div
            key={school.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            {/* School Image */}
            <div className="relative h-48">
              <img
                src={school.cover || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop'}
                alt={school.name}
                className="w-full h-full object-cover rounded-t-2xl"
              />
              {/* School logo Badge - positioned to hang off the bottom */}
              <div className="absolute -bottom-12 right-6 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-lg">
                <img
                  src={school.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=4F46E5&color=fff`}
                  alt="School logo"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            </div>

            {/* School Info */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800 mb-3 mt-10">{school.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{school.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{school.phone_number}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                      school.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  <span className={`text-sm font-medium ${
                      school.status === 'active'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>{getStatusText(school.status)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/admin/schools/view/${school.id}`)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => navigate(`/admin/schools/update/${school.id}`)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Overlay for filter dropdown */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default SchoolsPageAdmin;