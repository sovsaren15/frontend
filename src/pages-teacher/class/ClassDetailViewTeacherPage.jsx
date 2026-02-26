import React, { useState, useEffect } from 'react';
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
  Edit,
  UserCog,
  ChevronDown,
  Loader2,
  Upload,
  User,
} from 'lucide-react';
import { request } from "../../util/request";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const ClassDetailViewTeacherPage = () => {
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
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [studentToUpdate, setStudentToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [updating, setUpdating] = useState(false);

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

  const handleAddStudent = async (student) => {
    try {
      await request(`/classes/${classId}/students`, 'POST', { student_id: student.id });
      await fetchClassDetails();
      setModalSearchTerm('');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert(`${student.first_name} ${student.last_name} មាននៅក្នុងថ្នាក់រួចហើយ`);
      } else {
        alert(err.response?.data?.message || "បរាជ័យក្នុងការបន្ថែមសិស្ស");
      }
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

  const handleEditStatus = (student) => {
    setStudentToUpdate(student);
    setNewStatus(student.status || 'active');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!studentToUpdate) return;
    
    setUpdatingStatus(true);
    try {
      await request(`/students/${studentToUpdate.id}`, 'PUT', { status: newStatus });
      await fetchClassDetails();
      setIsStatusModalOpen(false);
      setStudentToUpdate(null);
    } catch (err) {
      console.error(err);
      alert("បរាជ័យក្នុងការកែប្រែស្ថានភាព");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdate = (student) => {
    setUpdateData({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      phone_number: student.phone_number || '',
      address: student.address || '',
      date_of_birth: student.date_of_birth ? new Date(student.date_of_birth).toISOString().split('T')[0] : '',
      enrollment_date: student.enrollment_date ? new Date(student.enrollment_date).toISOString().split('T')[0] : '',
      image_profile: student.image_profile,
      status: student.status || 'active'
    });
    setSelectedFile(null);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('first_name', updateData.first_name);
      formData.append('last_name', updateData.last_name);
      formData.append('phone_number', updateData.phone_number);
      formData.append('address', updateData.address);
      formData.append('date_of_birth', updateData.date_of_birth);
      formData.append('enrollment_date', updateData.enrollment_date);
      formData.append('status', updateData.status);
      
      if (selectedFile) {
        formData.append('image_profile', selectedFile);
      }

      await request(`/students/${updateData.id}`, 'PUT', formData);
      await fetchClassDetails();
      setIsUpdateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("បរាជ័យក្នុងការកែប្រែព័ត៌មាន");
    } finally {
      setUpdating(false);
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
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-100 p-8 w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/teacher/classes')}
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
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleUpdate(student)}
                                className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group-hover:opacity-100 text-slate-400 hover:text-indigo-600"
                                title="កែប្រែព័ត៌មាន"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleEditStatus(student)}
                                className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group-hover:opacity-100 text-slate-400 hover:text-emerald-600"
                                title="កែប្រែស្ថានភាព"
                              >
                                <UserCog size={18} />
                              </button>
                              <button 
                                onClick={() => handleRemoveStudent(student.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 text-slate-400 hover:text-red-600"
                                title="ដកសិស្សចេញ ពីថ្នាក់"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
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
                      onClick={() => handleAddStudent(student)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden relative">
                          <span>{student.first_name?.[0]}{student.last_name?.[0]}</span>
                          {student.image_profile && (
                            <img 
                              src={getImageUrl(student.image_profile)} 
                              alt="" 
                              className="w-full h-full object-cover absolute inset-0" 
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
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

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 relative">
            
            {/* Form Loading Overlay */}
            {updatingStatus && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white p-3 rounded-full shadow-lg border border-gray-100">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                </div>
              </div>
            )}

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">កែប្រែស្ថានភាពសិស្ស</h3>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveStatus}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0 overflow-hidden relative">
                    <span>{studentToUpdate?.first_name?.[0]}{studentToUpdate?.last_name?.[0]}</span>
                    {studentToUpdate?.image_profile && (
                      <img 
                        src={getImageUrl(studentToUpdate.image_profile)} 
                        alt="" 
                        className="w-full h-full object-cover absolute inset-0" 
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{studentToUpdate?.last_name} {studentToUpdate?.first_name}</h4>
                    <p className="text-sm text-gray-500 font-mono">ID: {studentToUpdate?.student_code || studentToUpdate?.id || 'N/A'}</p>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">ជ្រើសរើសស្ថានភាពថ្មី</label>
                <div className="relative">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none"
                  >
                    <option value="active">សកម្ម (Active)</option>
                    <option value="suspended">ព្យួរឈ្មោះ (Suspended)</option>
                    <option value="dropped_out">បោះបង់ការសិក្សា (Dropped Out)</option>
                    <option value="transferred">ផ្លាស់ចេញ (Transferred)</option>
                    <option value="graduated">បញ្ចប់ការសិក្សា (Graduated)</option>
                    <option value="inactive">អសកម្ម (Inactive)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  disabled={updatingStatus}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span>រក្សាទុក</span>
                  {updatingStatus && <Loader2 className="animate-spin" size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Student Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
            
            {updating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white p-3 rounded-full shadow-lg border border-gray-100">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                </div>
              </div>
            )}

            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900">កែប្រែព័ត៌មានសិស្ស</h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">នាមត្រកូល *</label>
                  <input type="text" name="last_name" value={updateData.last_name} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">នាមខ្លួន *</label>
                  <input type="text" name="first_name" value={updateData.first_name} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">លេខទូរស័ព្ទ</label>
                  <input type="tel" name="phone_number" value={updateData.phone_number} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃកំណើត</label>
                  <input type="date" name="date_of_birth" value={updateData.date_of_birth} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃចូលរៀន</label>
                  <input type="date" name="enrollment_date" value={updateData.enrollment_date} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">រូបភាពប្រវត្តិរូប</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {selectedFile ? (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                      ) : (
                        <>
                          <User size={24} className="text-gray-400" />
                          {updateData.image_profile && (
                            <img 
                              src={getImageUrl(updateData.image_profile)} 
                              alt="Current" 
                              className="w-full h-full object-cover absolute inset-0" 
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-gray-500">
                        <Upload size={20} />
                        <span>{selectedFile ? selectedFile.name : "ប្តូររូបភាព"}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">អាសយដ្ឋាន</label>
                  <textarea name="address" value={updateData.address} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" rows="2"></textarea>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button onClick={() => setIsUpdateModalOpen(false)} disabled={updating} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors disabled:opacity-50">បោះបង់</button>
              <button onClick={handleUpdateSubmit} disabled={updating} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"><span>រក្សាទុក</span>{updating && <Loader2 className="animate-spin" size={16} />}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetailViewTeacherPage;