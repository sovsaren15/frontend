import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { request } from "../../util/request";
import { useNavigate } from 'react-router-dom';

const ClassTeacherPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await request("/classes/teacher/me", "GET");
      if (response && response.data) {
        setClasses(response.data);
      } else {
        setClasses([]);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setError(err.message || 'Failed to load classes.');
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.academic_year && cls.academic_year.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full border border-red-100 text-center">
          <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Classes</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchClasses}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <GraduationCap className="w-10 h-10 text-indigo-600" />
                My Classes
              </h1>
              <p className="text-gray-600 text-lg">View and manage your assigned classes for this academic year.</p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Search by class name or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls, index) => (
              <div 
                key={cls.id} 
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-100 transform hover:-translate-y-1"
                style={{ animation: `fadeIn 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-indigo-100 transition-colors duration-300">
                      <BookOpen className="w-8 h-8 text-indigo-600" />
                    </div>
                    {cls.academic_year && (
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full border border-purple-100">
                        {cls.academic_year}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {cls.name}
                  </h3>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm font-medium">
                        {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">
                        {formatDate(cls.start_date)} - {formatDate(cls.end_date)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={() => navigate(`/teacher/classes/${cls.id}`)}>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-indigo-600 transition-colors">View Details</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="bg-gray-50 rounded-full p-6 inline-block mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Classes Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? `No classes match "${searchTerm}"` : "You haven't been assigned to any classes yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassTeacherPage;
