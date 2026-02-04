import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, BookOpen, Users, Calendar, Clock, Trash2 } from 'lucide-react';
import { request } from "./../../util/request"

// Assuming you have a way to get the current principal's school ID, e.g., from an auth context or by fetching it.
const ClassPrincipalPage = () => {
  const [classes, setClasses] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // State to hold the principal's school ID
  const [principalSchoolId, setPrincipalSchoolId] = useState(null);

  // Effect to fetch the principal's school ID
  useEffect(() => {
    const fetchPrincipalData = async () => {
      try {
        // This is a hypothetical endpoint to get the principal's school ID.
        // You might have an endpoint like /api/principals/me or /api/users/me that returns school_id.
        const response = await request("/principals/me", "GET"); // Adjust this endpoint as per your API
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

    if (!principalSchoolId) { // Only fetch if not already set
      fetchPrincipalData();
    }
  }, [navigate, principalSchoolId]);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!principalSchoolId) {
        // If principalSchoolId is not yet available, keep loading state true and return
        setLoading(true);
        return;
      }
      // Change to use getClassBySchoolId endpoint
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
  }, [navigate, principalSchoolId]); // Add principalSchoolId to dependencies

  useEffect(() => {
    // Only fetch classes once principalSchoolId is available
    if (principalSchoolId) {
      fetchClasses();
    }
  }, [fetchClasses, principalSchoolId]); // Add principalSchoolId to dependencies

  const filteredClasses = classes.filter(cls =>
    (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.teacher_names && cls.teacher_names.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper to format time from "HH:mm:ss" to "HH:mm"
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    // Assuming timeString is "HH:mm:ss"
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  
  // Helper to format date from "YYYY-MM-DDTHH:mm:ss.sssZ" to "YYYY-MM-DD"
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class? This will remove all associated schedules.")) {
      return;
    }
    try {
      await request(`/classes/${classId}`, 'DELETE');
      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete class');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 max-w-md">
          <p className="font-semibold mb-2">Error Loading Classes</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Classes</h1>
          <p className="text-gray-600">View and manage all classes in your institution</p>
        </div>
        <button onClick={() => navigate('/principal/classes/create')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
          <Plus size={20} />
          Add Class
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by class name or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Teachers</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subjects</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Academic Year</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dateline Course</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-150">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{cls.name}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-blue-500" />
                        {cls.teacher_names || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen size={16} className="mr-2 text-green-500" />
                        {cls.subject_names || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-purple-500" />
                        {cls.academic_year}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600 flex-col items-start">
                        <Clock size={16} className="mr-2 text-orange-500" />
                        <div>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatDate(cls.start_date)} to {formatDate(cls.end_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => navigate(`/principal/classes/view/${cls.id}`)} className="text-gray-400 hover:text-blue-600 mr-4 transition-colors duration-150 hover:scale-110 transform inline-block">
                        <Eye size={20} />
                      </button>
                      <button onClick={() => navigate(`/principal/classes/update/${cls.id}`)} className="text-gray-400 hover:text-green-600 transition-colors duration-150 hover:scale-110 transform inline-block">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteClass(cls.id)} className="text-gray-400 hover:text-red-600 ml-4 transition-colors duration-150 hover:scale-110 transform inline-block">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <BookOpen size={48} className="text-gray-300 mb-4" />
                      <p className="text-lg font-medium">No classes found.</p>
                      <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClassPrincipalPage;