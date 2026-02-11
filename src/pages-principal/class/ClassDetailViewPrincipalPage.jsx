import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  UserPlus,
  X,
  Search,
  MoreVertical,
  Mail,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { request } from "../../util/request";

const ClassDetailViewPrincipalPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
      setError(err.response?.data?.message || "បរាជ័យក្នុងការទាញយកទិន្នន័យថ្នាក់។");
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
    if (location.state?.openAddStudent) {
      setIsModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

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
      setModalSearchTerm('');
    } catch (err) {
      alert(err.response?.data?.message || "បរាជ័យក្នុងការបន្ថែមសិស្ស");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបសិស្សនេះចេញពីថ្នាក់មែនទេ?")) return;
    try {
      await request(`/classes/${classId}/students/${studentId}`, 'DELETE');
      await fetchClassDetails();
    } catch (err) {
      alert(err.response?.data?.message || "បរាជ័យក្នុងការលុបសិស្ស");
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('km-KH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const uniqueTeachers = useMemo(() => {
    if (!classData?.schedules) return [];
    return [...new Set(classData.schedules.map(s => s.teacher_name).filter(Boolean))];
  }, [classData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center font-kantumruy">
        <div className="text-center">
          <div className="relative mb-6">
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
          <h3 className="text-2xl font-bold text-slate-900 mb-3">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/principal/classes')}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            ត្រឡប់ទៅបញ្ជីថ្នាក់
          </button>
        </div>
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div className="min-h-screen p-4 lg:p-8 font-kantumruy">
      <div className=" mx-auto space-y-6">
        {/* Header Card */}
        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg border border-white/80 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-200/30 via-transparent to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-200/20 via-transparent to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-3">{classData.name}</h1>
                  <div className="flex items-center gap-2 text-slate-600 mb-3 text-sm">
                    <Users size={16} className="text-indigo-500" />
                    <span className="font-semibold">គ្រូបង្រៀន:</span>
                    <span>{uniqueTeachers.length > 0 ? uniqueTeachers.join(', ') : 'មិនមាន'}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm">
                      <Calendar size={16} className="text-purple-500" />
                      {classData.academic_year}
                    </span>
                    <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm">
                      <Clock size={16} className="text-indigo-500" />
                      {formatTime(classData.start_time)} - {formatTime(classData.end_time)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 px-6 py-4 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">សិស្សសរុប</p>
                <p className="text-4xl font-bold text-indigo-700">{classData.students?.length || 0}</p>
              </div>
            </div>

            {/* Date Range Info */}
            <div className="bg-slate-50/60 backdrop-blur-sm border border-slate-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span className="font-medium">រយៈពេលសិក្សា:</span>
                <span>{formatDate(classData.start_date)} — {formatDate(classData.end_date)}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('students')}
                className={`relative px-6 py-3 font-semibold text-sm transition-all ${
                  activeTab === 'students' 
                    ? 'text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  សិស្ស ({classData.students?.length || 0})
                </div>
                {activeTab === 'students' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-lg"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`relative px-6 py-3 font-semibold text-sm transition-all ${
                  activeTab === 'schedule' 
                    ? 'text-indigo-600' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  កាលវិភាគ ({classData.schedules?.length || 0})
                </div>
                {activeTab === 'schedule' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-lg"></div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {activeTab === 'students' ? (
            <div>
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-slate-50/60 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">សិស្សដែលបានចុះឈ្មោះ</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{classData.students?.length || 0} នាក់ក្នុងថ្នាក់នេះ</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  <UserPlus size={18} />
                  បន្ថែមសិស្ស
                </button>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200">
                      <th className="text-left py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">ល.រ</th>
                      <th className="text-left py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">ឈ្មោះសិស្ស</th>
                      <th className="text-left py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">ភេទ</th>
                      <th className="text-left py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">ថ្ងៃខែឆ្នាំកំណើត</th>
                      <th className="text-left py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">អ៊ីមែល</th>
                      <th className="text-left py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">ស្ថានភាព</th>
                      <th className="text-right py-4 px-6 text-slate-600 font-semibold text-sm uppercase tracking-wider">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classData.students && classData.students.length > 0 ? (
                      classData.students.map((student, index) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 px-6 text-sm font-medium text-slate-500">
                            {index + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {student.first_name?.[0]}{student.last_name?.[0]}
                              </div>
                              <span className="font-semibold text-slate-900">
                                {student.first_name} {student.last_name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-sm">
                            {student.sex === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-sm">
                            {formatDate(student.date_of_birth)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail size={14} className="text-slate-400" />
                              <span className="text-sm">{student.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              សកម្ម
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleRemoveStudent(student.id)}
                              className="p-2 hover:bg-red rounded-lg transition-colors  group-hover:opacity-100 text-slate-400 hover:text-red-600"
                              title="ដកសិស្សចេញ ពីថ្នាក់"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-16 text-center">
                          <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-slate-500 font-medium">មិនទាន់មានសិស្សចុះឈ្មោះនៅឡើយទេ</p>
                          <p className="text-slate-400 text-sm mt-1">ចុច "បន្ថែមសិស្ស" ដើម្បីចុះឈ្មោះសិស្សក្នុងថ្នាក់នេះ</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">កាលវិភាគថ្នាក់</h3>
                <p className="text-sm text-slate-500 mt-0.5">កាលវិភាគប្រចាំសប្តាហ៍សម្រាប់ថ្នាក់នេះ</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classData.schedules && classData.schedules.length > 0 ? (
                  classData.schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-slate-50/60 border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-indigo-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 shadow-sm">
                          {schedule.day_of_week}
                        </span>
                        <Clock size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                        {schedule.subject_name || 'មិនស្គាល់មុខវិជ្ជា'}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                        <Users size={14} />
                        <span>{schedule.teacher_name || 'មិនស្គាល់គ្រូ'}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        <Clock size={14} className="text-slate-400" />
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 font-medium">មិនមានកាលវិភាគទេ</p>
                    <p className="text-slate-400 text-sm mt-1">កាលវិភាគនឹងបង្ហាញនៅទីនេះនៅពេលបានកំណត់</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-red-600 bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-sm"
          >
            បោះបង់
          </button>
          
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/60">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">បន្ថែមសិស្ស</h3>
                  <p className="text-sm text-slate-500 mt-1">ជ្រើសរើសសិស្សដើម្បីបន្ថែមទៅក្នុងថ្នាក់នេះ</p>
                </div>
                <button 
                  onClick={() => { setIsModalOpen(false); setModalSearchTerm(''); }}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល..."
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-xl transition-all outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all group cursor-pointer"
                      onClick={() => handleAddStudent(student.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {student.first_name?.[0]}{student.last_name?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {student.first_name} {student.last_name}
                          </h4>
                          <p className="text-sm text-slate-500">{student.email}</p>
                        </div>
                      </div>
                      <button
                        className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm hover:shadow-md"
                        title="បន្ថែមទៅថ្នាក់"
                      >
                        <UserPlus size={20} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600 font-medium">រកមិនឃើញសិស្សទេ</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {modalSearchTerm 
                        ? `មិនមានលទ្ធផលសម្រាប់ "${modalSearchTerm}"`
                        : "សិស្សទាំងអស់បានចុះឈ្មោះរួចហើយ"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50/60 flex justify-end">
              <button
                onClick={() => { setIsModalOpen(false); setModalSearchTerm(''); }}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-all"
              >
                បោះបង់
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailViewPrincipalPage;
