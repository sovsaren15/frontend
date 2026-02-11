import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  School,
  Mail,
  Loader2,
  UserCircle,
  Clock,
  ChevronRight,
  BookOpen,
  Shield,
  GraduationCap,
  Edit,
  MoreVertical,
  History,
  Users,
  Plus,
  Upload,
  X,
  Trash2
} from 'lucide-react';
import { request } from "../../util/request";
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'suspended': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'dropped_out': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'transferred': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'graduated': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getStatusLabel = (status) => {
  const labels = {
    active: 'សកម្ម',
    suspended: 'ព្យួរឈ្មោះ',
    dropped_out: 'បោះបង់ការសិក្សា',
    transferred: 'ផ្លាស់ចេញ',
    graduated: 'បញ្ចប់ការសិក្សា',
    inactive: 'អសកម្ម'
  };
  return labels[status] || status;
};

const StudentAvatar = ({ src, alt, size = 96, className }) => {
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 ${className}`}>
        <UserCircle size={size * 0.6} className="text-slate-400" />
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover"
        onError={() => setError(true)} 
      />
    </div>
  );
};

const StudentDetailViewPrincipal = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  const handleUpdateClick = () => {
    if (!student) return;
    setUpdateData({
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

  const handleUpdateSubmit = async () => {
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

      await request(`/students/${studentId}`, 'PUT', formData);
      
      toast.success("កែប្រែព័ត៌មានសិស្សជោគជ័យ");
      setIsUpdateModalOpen(false);
      
      // Refresh student data
      const res = await request(`/students/${studentId}`, 'GET');
      setStudent(res.data || res);
      
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការកែប្រែព័ត៌មាន");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបសិស្សនេះមែនទេ?")) {
      try {
        await request(`/students/${studentId}`, 'DELETE');
        toast.success("លុបសិស្សជោគជ័យ");
        navigate(-1);
      } catch (err) {
        console.error(err);
        toast.error("បរាជ័យក្នុងការលុបសិស្ស");
      }
    }
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await request(`/students/${studentId}`, 'GET');
        setStudent(res.data || res);
      } catch (err) {
        console.error(err);
        toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានសិស្ស");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudent();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-3 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <User className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <p className="text-slate-700 font-medium mb-1">កំពុងទាញយកព័ត៌មានសិស្ស</p>
          <p className="text-slate-500 text-sm">សូមរង់ចាំមួយភ្លែត...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="p-4 bg-slate-50 rounded-xl inline-block mb-6">
            <UserCircle className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg mb-2">រកមិនឃើញសិស្ស</h3>
          <p className="text-slate-600 text-sm mb-6">
            សិស្សនេះមិនមានក្នុងប្រព័ន្ធទេ ឬត្រូវបានលុបចោល។
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium w-full"
          >
            ត្រឡប់ក្រោយ
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'មិនមាន';
    return new Date(dateString).toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderText = (gender) => {
    if (!gender) return 'មិនមាន';
    return gender === 'Female' || gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស';
  };

  return (
    <div className="min-h-screen  font-kantumruy pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-indigo-600" size={28} />
                ព័ត៌មានលម្អិតសិស្ស
              </h1>
              <p className="text-gray-500 mt-1">មើលនិងគ្រប់គ្រងព័ត៌មានសិស្ស</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                onClick={handleUpdateClick}
              >
                <Edit size={20} />
                កែប្រែព័ត៌មាន
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Profile with Timeline */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Gradient Cover */}
              <div className="h-32 bg-primary relative">
                <div className="absolute top-4 right-4">

                </div>
              </div>
              
              <div className="px-6 pb-6">
                {/* Avatar & Name */}
                <div className="relative flex flex-col items-center -mt-16 mb-6">
                  <div className="relative mb-4">
                    <div className="w-62 h-73 rounded-2xl border-white bg-white overflow-hidden">
                      <StudentAvatar 
                        src={getImageUrl(student.image_profile)} 
                        alt={`${student.last_name} ${student.first_name}`} 
                        size={128}
                        className="w-full h-full rounded-2xl"
                      />
                    </div>
                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${
                      student.status === 'active' ? 'bg-emerald-500' : 
                      student.status === 'inactive' ? 'bg-slate-400' : 
                      'bg-amber-500'
                    }`}></div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {student.last_name} {student.first_name}
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Shield size={14} className="text-indigo-500" />
                        <span className="font-mono">ID: {student.student_code || student.id || 'N/A'}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-indigo-500" />
                        <span>{getGenderText(student.gender)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions & Timeline Combined Section */}
                <div className="space-y-6">

                  {/* Timeline */}
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <History className="text-indigo-600" size={18} />
                      ប្រវត្តិសង្ខេប
                    </h3>
                    
                    <div className="relative pl-4 border-l-2 border-gray-200 space-y-6">
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50"></div>
                        <p className="text-xs font-medium text-gray-500 mb-1">កាលបរិច្ឆេទចូលរៀន</p>
                        <p className="font-medium text-gray-900">{formatDate(student.enrollment_date)}</p>
                      </div>
                      
                      <div className="relative">
                        <div className={`absolute -left-[21px] top-1.5 w-3 h-3 rounded-full ${
                          student.status === 'active' ? 'bg-emerald-500 ring-emerald-50' : 'bg-gray-400 ring-gray-50'
                        } border-2 border-white ring-4`}></div>
                        <p className="text-xs font-medium text-gray-500 mb-1">ស្ថានភាពបច្ចុប្បន្ន</p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(student.status)}`}>
                            {getStatusLabel(student.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Classes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="text-indigo-600" size={24} />
                ព័ត៌មានទំនាក់ទំនង
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="p-2.5 bg-white text-blue-600 rounded-lg shadow-sm shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">លេខទូរស័ព្ទ</p>
                    <p className="font-semibold text-gray-900 truncate">{student.phone_number || 'មិនមាន'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="p-2.5 bg-white text-emerald-600 rounded-lg shadow-sm shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">អ៊ីមែល</p>
                    <p className="font-semibold text-gray-900 truncate">{student.email || 'មិនមាន'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="p-2.5 bg-white text-orange-600 rounded-lg shadow-sm shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">អាសយដ្ឋាន</p>
                    <p className="font-semibold text-gray-900 line-clamp-2" title={student.address}>{student.address || 'មិនមាន'}</p>
                  </div>
                </div>
              </div>

              {/* Birth Date */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="p-2.5 bg-white text-purple-600 rounded-lg shadow-sm shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ថ្ងៃខែឆ្នាំកំណើត</p>
                    <p className="font-semibold text-gray-900">{formatDate(student.date_of_birth)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="text-indigo-600" size={24} />
                  ព័ត៌មានសិក្សា
                </h3>
                {student.classes_info && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                    {student.classes_info.split(',').length} ថ្នាក់
                  </span>
                )}
              </div>
              
              {student.classes_info ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {student.classes_info.split(',').map((info) => {
                    const [id, name] = info.split(':');
                    return (
                      <div 
                        key={id}
                        onClick={() => navigate(`/principal/classes/view/${id}`)}
                        className="group relative overflow-hidden p-5 rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer bg-white"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <BookOpen size={64} className="text-indigo-600 transform rotate-12 translate-x-2 -translate-y-2" />
                        </div>
                        <div className="relative z-10">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <BookOpen size={20} />
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-indigo-700 transition-colors">{name}</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>ចុចដើម្បីមើលលម្អិត</span>
                            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <School className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 font-medium">មិនទាន់មានថ្នាក់រៀននៅឡើយ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            ត្រឡប់ក្រោយ
          </button>
          <button 
            onClick={handleDelete}
            className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2"
          >
            <Trash2 size={20} />
            លុបសិស្ស
          </button>
        </div>
      </div>

      {/* Update Student Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
            
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ស្ថានភាព</label>
                  <select name="status" value={updateData.status} onChange={handleUpdateChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="active">សកម្ម</option>
                    <option value="suspended">ព្យួរឈ្មោះ</option>
                    <option value="dropped_out">បោះបង់ការសិក្សា</option>
                    <option value="transferred">ផ្លាស់ចេញ</option>
                    <option value="graduated">បញ្ចប់ការសិក្សា</option>
                    <option value="inactive">អសកម្ម</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">រូបភាពប្រវត្តិរូប</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedFile ? (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <StudentAvatar 
                          src={getImageUrl(updateData.image_profile)} 
                          alt="Current" 
                          className="w-full h-full text-gray-400 p-2" 
                        />
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
              <button onClick={handleUpdateSubmit} disabled={updating} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 disabled:opacity-70"><span>រក្សាទុក</span>{updating && <Loader2 className="animate-spin" size={16} />}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetailViewPrincipal;