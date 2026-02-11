import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Filter,
  Loader2,
  School,
  MapPin,
  Phone,
  Calendar,
  UserCircle,
  Eye,
  Edit,
  UserCog,
  X,
  ChevronDown,
  Plus,
  Upload
} from 'lucide-react';
import { request } from "../../util/request";
import toast from 'react-hot-toast';

const StudentAvatar = ({ src, alt, size = 24, className }) => {
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return <UserCircle size={size} className={className} />;
  }
  
  return <img src={src} alt={alt} className={`w-full h-full object-cover ${className || ''}`} onError={() => setError(true)} />;
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const StudentPrincipalPages = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [studentToUpdate, setStudentToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [registerData, setRegisterData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    enrollment_date: new Date().toISOString().split('T')[0]
  });
  const [updateData, setUpdateData] = useState({});

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await request('/classes', 'GET');
        const classList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setClasses(classList);
      } catch (err) {
        console.error(err);
        toast.error("បរាជ័យក្នុងការទាញយកថ្នាក់រៀន");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const endpoint = selectedClass ? `/students?class_id=${selectedClass}` : '/students';
      const res = await request(endpoint, 'GET');
      const studentList = res.data?.data || res.data || [];
      setStudents(studentList);
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការទាញយកសិស្ស");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students
  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  // Filter Students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(stu => (stu.status || 'active') === statusFilter);
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(stu => 
        (stu.first_name && stu.first_name.toLowerCase().includes(lowerTerm)) ||
        (stu.last_name && stu.last_name.toLowerCase().includes(lowerTerm)) ||
        (stu.student_code && stu.student_code.toLowerCase().includes(lowerTerm)) ||
        (stu.id && stu.id.toString().includes(lowerTerm))
      );
    }
    return filtered;
  }, [students, searchTerm, statusFilter]);

  const getClassInfo = () => classes.find(c => c.id == selectedClass);

  const getStatusLabel = (status) => {
    const labels = {
      active: 'សកម្ម',
      inactive: 'អសកម្ម'
    };
    return labels[status] || 'សកម្ម';
  };

  const handleViewDetails = (student) => {
    navigate(`/principal/students/${student.id}`);
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

  const handleUpdateSubmit = async () => {
    setUpdatingStatus(true);
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
      
      toast.success("កែប្រែព័ត៌មានសិស្សជោគជ័យ");
      setIsUpdateModalOpen(false);
      setSelectedFile(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការកែប្រែព័ត៌មាន");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditStatus = (student) => {
    setStudentToUpdate(student);
    setNewStatus(student.status || 'active');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!studentToUpdate) return;
    
    setUpdatingStatus(true);
    try {
      await request(`/students/${studentToUpdate.id}`, 'PUT', { status: newStatus });
      
      toast.success("បានកែប្រែស្ថានភាពជោគជ័យ");
      setIsStatusModalOpen(false);
      
      setStudents(prev => prev.map(s => 
        s.id === studentToUpdate.id ? { ...s, status: newStatus } : s
      ));
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការកែប្រែស្ថានភាព");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!selectedClass) {
      toast.error("សូមជ្រើសរើសថ្នាក់ជាមុនសិន");
      return;
    }
    if (!registerData.first_name || !registerData.last_name || !registerData.email || !registerData.password) {
      toast.error("សូមបំពេញព័ត៌មានចាំបាច់ (ឈ្មោះ, អ៊ីមែល, ពាក្យសម្ងាត់)");
      return;
    }

    setRegistering(true);
    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('first_name', registerData.first_name);
      formData.append('last_name', registerData.last_name);
      formData.append('email', registerData.email);
      formData.append('password', registerData.password);
      formData.append('phone_number', registerData.phone_number);
      formData.append('address', registerData.address);
      formData.append('date_of_birth', registerData.date_of_birth);
      formData.append('enrollment_date', registerData.enrollment_date);
      if (selectedFile) {
        formData.append('image_profile', selectedFile);
      }

      // 1. Create Student
      const res = await request('/students', 'POST', formData);
      const newStudentId = res.id || res.data?.id;

      if (newStudentId) {
        // 2. Assign to Class
        await request(`/classes/${selectedClass}/students`, 'POST', { student_id: newStudentId });
        
        toast.success("ចុះឈ្មោះសិស្សជោគជ័យ");
        setIsRegisterModalOpen(false);
        setRegisterData({ ...registerData, first_name: '', last_name: '', email: '', password: '', phone_number: '', address: '' }); // Reset form
        setSelectedFile(null);
        fetchStudents(); // Refresh list
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "បរាជ័យក្នុងការចុះឈ្មោះ");
    } finally {
      setRegistering(false);
    }
  };

  if (loadingClasses) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10 font-kantumruy">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-indigo-600" size={28} />
                បញ្ជីសិស្សក្នុងថ្នាក់
              </h1>
              <p className="text-gray-500 mt-1">មើលព័ត៌មានសិស្សតាមថ្នាក់រៀននីមួយៗ</p>
            </div>
            
            <button 
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              <Plus size={20} />
              ចុះឈ្មោះសិស្ស
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">ជ្រើសរើសថ្នាក់</label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                >
                  <option value="">ថ្នាក់ទាំងអស់ (All Classes)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">ស្ថានភាព</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white"
                >
                  <option value="all">ទាំងអស់</option>
                  <option value="active">សកម្ម</option>
                  <option value="inactive">អសកម្ម</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">ស្វែងរកសិស្ស</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-indigo-600 mb-3" size={32} />
              <p className="text-gray-500">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="mx-auto mb-3 text-gray-300" size={48} />
              <p>រកមិនឃើញសិស្សនៅក្នុងថ្នាក់នេះទេ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center">ល.រ</th>
                    <th className="px-6 py-4">ព័ត៌មានសិស្ស</th>
                    <th className="px-6 py-4 text-center">ភេទ</th>
                    <th className="px-6 py-4 text-center">ស្ថានភាព</th>
                    <th className="px-6 py-4">ទំនាក់ទំនង</th>
                    <th className="px-6 py-4">អាសយដ្ឋាន</th>
                    <th className="px-6 py-4 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-center text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 overflow-hidden">
                            <StudentAvatar src={getImageUrl(student.image_profile)} alt={`${student.last_name} ${student.first_name}`} size={24} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {student.last_name} {student.first_name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {student.student_code || student.id || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Calendar size={10} />
                                {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('km-KH') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.gender === 'Female' || student.gender === 'ស្រី'
                            ? 'bg-pink-50 text-pink-700 border border-pink-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {student.gender === 'Female' || student.gender === 'ស្រី' ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' :
                          student.status === 'suspended' ? 'bg-red-50 text-red-700 border border-red-100' :
                          student.status === 'dropped_out' ? 'bg-gray-50 text-gray-700 border border-gray-100' :
                          student.status === 'transferred' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {getStatusLabel(student.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          <span>{student.phone_number || 'គ្មានលេខទូរស័ព្ទ'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2 text-gray-600 max-w-xs">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span className="truncate" title={student.address}>{student.address || 'គ្មានអាសយដ្ឋាន'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewDetails(student)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="មើលលម្អិត"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdate(student)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="កែប្រែ"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleEditStatus(student)}
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="កែប្រែស្ថានភាព"
                          >
                            <UserCog size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Footer Stats */}
          {filteredStudents.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4 text-sm text-gray-500 flex justify-between items-center">
              <span>បង្ហាញ {filteredStudents.length} សិស្ស</span>
              <span>សរុបក្នុងថ្នាក់: {students.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative">
            
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
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg overflow-hidden shrink-0">
                  <StudentAvatar src={getImageUrl(studentToUpdate?.image_profile)} alt="" size={28} />
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
                  <option value="inactive">អសកម្ម (Inactive)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                disabled={updatingStatus}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                បោះបង់
              </button>
              <button
                onClick={handleSaveStatus}
                disabled={updatingStatus}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>រក្សាទុក</span>
                {updatingStatus && <Loader2 className="animate-spin" size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Student Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
            
            {registering && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <div className="bg-white p-3 rounded-full shadow-lg border border-gray-100">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                </div>
              </div>
            )}

            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-gray-900">ចុះឈ្មោះសិស្សថ្មី</h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">នាមត្រកូល *</label>
                  <input type="text" name="last_name" value={registerData.last_name} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="នាមត្រកូល" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">នាមខ្លួន *</label>
                  <input type="text" name="first_name" value={registerData.first_name} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="នាមខ្លួន" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">អ៊ីមែល *</label>
                  <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ពាក្យសម្ងាត់ *</label>
                  <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="******" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">លេខទូរស័ព្ទ</label>
                  <input type="tel" name="phone_number" value={registerData.phone_number} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="012..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃកំណើត</label>
                  <input type="date" name="date_of_birth" value={registerData.date_of_birth} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃចូលរៀន</label>
                  <input type="date" name="enrollment_date" value={registerData.enrollment_date} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">រូបភាពប្រវត្តិរូប</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedFile ? (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={32} className="text-gray-400" />
                      )}
                    </div>
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-gray-500">
                        <Upload size={20} />
                        <span>{selectedFile ? selectedFile.name : "ចុចដើម្បីជ្រើសរើសរូបភាព"}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {selectedFile && (
                      <button onClick={() => setSelectedFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={20}/></button>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">អាសយដ្ឋាន</label>
                  <textarea name="address" value={registerData.address} onChange={handleRegisterChange} className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none" rows="2" placeholder="ភូមិ, ឃុំ, ស្រុក..."></textarea>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                disabled={registering}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors disabled:opacity-50"
              >
                បោះបង់
              </button>
              <button
                onClick={handleRegisterSubmit}
                disabled={registering}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
              >
                <span>ចុះឈ្មោះ</span>
                {registering && <Loader2 className="animate-spin" size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Student Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
            
            {updatingStatus && (
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
              <button onClick={() => setIsUpdateModalOpen(false)} disabled={updatingStatus} className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors disabled:opacity-50">បោះបង់</button>
              <button onClick={handleUpdateSubmit} disabled={updatingStatus} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2 disabled:opacity-70"><span>រក្សាទុក</span>{updatingStatus && <Loader2 className="animate-spin" size={16} />}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPrincipalPages;
