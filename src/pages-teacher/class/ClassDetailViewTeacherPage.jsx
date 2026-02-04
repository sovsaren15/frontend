import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Mail,
  Sparkles,
  AlertCircle,
  UserPlus,
  X,
  Search,
} from 'lucide-react';
import { request } from "../../util/request";

const ClassDetailViewTeacherPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('students');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);

  const fetchClassDetails = async () => {
    try {
      if (!classData) setLoading(true);
      const response = await request(`/classes/${classId}`, "GET");
      setClassData(response.data);
    } catch (err) {
      console.error("Error fetching class details:", err);
      setError(err.response?.data?.message || "Failed to load class details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  useEffect(() => {
    if (isModalOpen && classData?.school_id) {
      const fetchStudents = async () => {
        try {
          const response = await request(`/students?school_id=${classData.school_id}`, "GET");
          setAvailableStudents(response.data.data || response.data || []);
        } catch (err) {
          console.error("Failed to fetch students", err);
        }
      };
      fetchStudents();
    }
  }, [isModalOpen, classData?.school_id]);

  const handleAddStudent = async (studentId) => {
    try {
      await request(`/classes/${classId}/students`, 'POST', { student_id: studentId });
      await fetchClassDetails();
      // Optional: Show success message
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add student");
    }
  };

  const enrolledIds = new Set(classData?.students?.map(s => s.id) || []);
  const filteredStudents = availableStudents.filter(s => 
    !enrolledIds.has(s.id) && 
    (
      (s.first_name && s.first_name.toLowerCase().includes(modalSearchTerm.toLowerCase())) ||
      (s.last_name && s.last_name.toLowerCase().includes(modalSearchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(modalSearchTerm.toLowerCase()))
    )
  );

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading class details...</p>
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Class</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/teacher/classes')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button 
          onClick={() => navigate('/teacher/classes')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to My Classes
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
          
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                  <GraduationCap className="w-10 h-10 text-indigo-600" />
                  {classData.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                    <Calendar size={16} className="text-purple-500" />
                    Academic Year: {classData.academic_year}
                  </span>
                  <span className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                    <Clock size={16} className="text-indigo-500" />
                    {formatTime(classData.start_time)} - {formatTime(classData.end_time)}
                  </span>
                </div>
              </div>
              <div className="bg-indigo-50 px-6 py-3 rounded-2xl">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Total Students</p>
                <p className="text-3xl font-bold text-indigo-600">{classData.students?.length || 0}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                  activeTab === 'students' 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  Students List
                </div>
                {activeTab === 'students' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-6 py-3 font-semibold text-sm transition-all relative ${
                  activeTab === 'schedule' 
                    ? 'text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  Class Schedule
                </div>
                {activeTab === 'schedule' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-lg p-6 min-h-[400px]">
          {activeTab === 'students' ? (
            <div>
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
                >
                  <UserPlus size={18} />
                  Add Student
                </button>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Student Name</th>
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Email</th>
                    <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {classData.students && classData.students.length > 0 ? (
                    classData.students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="py-4 px-4 text-gray-600 flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          {student.email}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-12 text-center text-gray-500">
                        No students enrolled in this class yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.schedules && classData.schedules.length > 0 ? (
                classData.schedules.map((schedule) => (
                  <div key={schedule.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-white px-3 py-1 rounded-lg text-sm font-bold text-indigo-600 shadow-sm">
                        {schedule.day_of_week}
                      </span>
                      <Clock size={18} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{schedule.subject_name || 'Unknown Subject'}</h3>
                    <p className="text-gray-500 text-sm mb-3 flex items-center gap-2">
                      <Users size={14} />
                      {schedule.teacher_name || 'Unknown Teacher'}
                    </p>
                    <div className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-xl inline-block border border-gray-100">
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  No schedule available for this class.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Add Student to Class</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-xl focus:ring-0 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{student.first_name} {student.last_name}</h4>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddStudent(student.id)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Add to class"
                      >
                        <UserPlus size={20} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No students found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailViewTeacherPage;
