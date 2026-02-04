import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Plus, Eye, Edit, User, Mail } from 'lucide-react';
import {request} from "./../../util/request"

const TeacherPrincipalPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // This function fetches teachers and can be called independently
  const fetchTeachers = useCallback(async (schoolId, currentSearchTerm, currentStatusFilter) => {
    if (!schoolId) return;

    try {
      const response = await request(`/teachers/school/${schoolId}`, "GET", {
        params: {
          search: currentSearchTerm || '', // Ensure search is always a string
          status: currentStatusFilter === 'all' ? '' : (currentStatusFilter || ''), // Ensure status is always a string
        }
      });
      setTeachers(response.data.data);
       console.log("Current school ID:", schoolId);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token'); // Ensure logout on 401
        localStorage.removeItem('user'); // Ensure logout on 401
        navigate('/login'); // Redirect to login
      }
      setError(err.message || 'An unexpected error occurred.');
      console.error("Error fetching teachers:", err);
    } finally {
      // Only the main effect will control the top-level loading state
    }
  }, [navigate]); // navigate is a dependency because it's used inside the callback

  // Main effect to orchestrate all data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get dashboard data to find the school ID
        const dashboardResponse = await request("/principals/dashboard", "GET");
        const schoolData = dashboardResponse.data;
        setDashboardData(schoolData);

        // 2. If school exists, fetch teachers for that school
        if (schoolData && schoolData.school) {
          await fetchTeachers(schoolData.school.id, searchTerm, statusFilter);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
        setError(err.message || 'An unexpected error occurred.');
        console.error("Error during initial data fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // This effect should only run when search or filter terms change.
    // The initial load is handled within.
  }, [navigate, searchTerm, statusFilter, fetchTeachers]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!dashboardData || !dashboardData.school) {
    return (
      <div className="p-8 text-center text-gray-500">
        You are not assigned to a school. Cannot display teachers.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Teachers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20} />
          Add Teacher
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full bg-white border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-lg shadow">
        <ul className="divide-y divide-gray-200">
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <li key={teacher.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{teacher.first_name} {teacher.last_name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={14} /> {teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {teacher.status}
                  </span>
                  <button className="text-gray-500 hover:text-blue-600"><Eye size={20} /></button>
                  <button className="text-gray-500 hover:text-green-600"><Edit size={20} /></button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-8 text-center text-gray-500">No teachers found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default TeacherPrincipalPage