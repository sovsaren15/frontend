import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Mail,
  Loader2,
  UserCircle,
  Edit,
  Trash2,
  Briefcase,
  CheckCircle2,
  XCircle,
  Upload,
  X,
  Camera
} from 'lucide-react';
import { request } from "./../../util/request";
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const TeacherDetailViewPrincipal = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchTeacher();
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      // Assuming the endpoint is /teachers/:id
      const res = await request(`/teachers/${teacherId}`, 'GET');
      setTeacher(res.data || res);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានគ្រូ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = () => {
    if (!teacher) return;
    setUpdateData({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      email: teacher.email || '',
      phone_number: teacher.phone_number || '',
      address: teacher.address || '',
      place_of_birth: teacher.place_of_birth || '',
      sex: teacher.sex || '',
      date_of_birth: teacher.date_of_birth ? new Date(teacher.date_of_birth).toISOString().split('T')[0] : '',
      experience: teacher.experience || '',
      status: teacher.status || 'active',
    });
    setPreviewUrl(getImageUrl(teacher.image_profile));
    setSelectedFile(null);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== null && updateData[key] !== undefined) {
            formData.append(key, updateData[key]);
        }
      });
      
      if (selectedFile) {
        formData.append('image_profile', selectedFile);
      }

      await request(`/teachers/${teacherId}`, 'PUT', formData);
      toast.success("កែប្រែព័ត៌មានគ្រូជោគជ័យ");
      setIsUpdateModalOpen(false);
      fetchTeacher();
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការកែប្រែព័ត៌មាន");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបគណនីគ្រូនេះមែនទេ?")) {
      try {
        await request(`/teachers/${teacherId}`, 'DELETE');
        toast.success("លុបគណនីគ្រូជោគជ័យ");
        navigate('/principal/teachers');
      } catch (error) {
        console.error(error);
        toast.error("បរាជ័យក្នុងការលុបគណនី");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <UserCircle size={64} className="mb-4 text-gray-300" />
        <p className="text-lg font-medium">រកមិនឃើញព័ត៌មានគ្រូ</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 hover:underline">ត្រឡប់ក្រោយ</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10 font-kantumruy">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ព័ត៌មានលម្អិតគ្រូបង្រៀន</h1>
                <p className="text-gray-500 mt-1">មើលនិងគ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួនរបស់គ្រូ</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleUpdateClick}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Edit size={20} />
                <span>កែប្រែព័ត៌មាន</span>
              </button>
              <button 
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <Trash2 size={20} />
                <span>លុបគណនី</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Profile Card */}
{/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-indigo-600 relative"></div>
              <div className="px-6 pb-6 text-center relative">
                <div className="-mt-16 mb-4 inline-block relative">
                  <div className="w-32 h-32 rounded-2xl p-1 bg-white shadow-md">
                    <img 
                      src={getImageUrl(teacher.image_profile) || `https://ui-avatars.com/api/?name=${teacher.first_name}+${teacher.last_name}&background=random`} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-xl bg-gray-100"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${teacher.first_name}+${teacher.last_name}&background=random`; }}
                    />
                  </div>
                  <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-white ${teacher.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{teacher.last_name} {teacher.first_name}</h2>
                <p className="text-gray-500 font-medium mb-4">{teacher.email}</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {teacher.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    គ្រូបង្រៀន
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-6 space-y-4">
                  
                  {/* Phone & Date of Birth on ONE LINE */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                           <Phone size={18} />
                        </div>
                        <span className="font-medium text-sm">{teacher.phone_number || 'មិនមាន'}</span>
                     </div>

                     <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                           <Calendar size={18} />
                        </div>
                        <span className="font-medium text-sm">
                           {teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString('km-KH') : 'មិនមាន'}
                        </span>
                     </div>
                  </div>

                </div>

                <div className="border-t border-gray-100 pt-6 text-left mt-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">បទពិសោធន៍ការងារ</label>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">
                        {teacher.experience || 'មិនមានទិន្នន័យបទពិសោធន៍'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User size={24} className="text-indigo-600" />
                ព័ត៌មានផ្ទាល់ខ្លួន
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ភេទ</label>
                  <p className="text-gray-900 font-medium">
                    {teacher.sex === 'Male' ? 'ប្រុស' : teacher.sex === 'Female' ? 'ស្រី' : 'មិនបញ្ជាក់'}
                  </p>
                </div>

                {/* Place of Birth */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ទីកន្លែងកំណើត</label>
                  <p className="text-gray-900 font-medium">{teacher.place_of_birth || 'មិនមាន'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">លេខទូរស័ព្ទ :</label>
                  <p className="text-gray-900 font-medium">{teacher.phone_number || 'មិនមាន'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase whitespace-nowrap">ថ្ងៃកំណើត :</label>
                  <p className="text-gray-900 font-medium">
                    {teacher.date_of_birth ? new Date(teacher.date_of_birth).toLocaleDateString('km-KH') : 'មិនមាន'}
                  </p>
                </div>

                {/* Address (Span full width) */}
                <div className="md:col-span-2">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">អាសយដ្ឋានបច្ចុប្បន្ន</label>
                   <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                        <MapPin size={18} />
                      </div>
                      <span className="font-medium text-gray-700">{teacher.address || 'មិនមាន'}</span>
                   </div>
                </div>



              </div>
            </div>

            {/* Teaching Info (Placeholder for future expansion) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase size={24} className="text-indigo-600" />
                ព័ត៌មានការងារ
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">សាលា</label>
                    <p className="text-gray-900 font-medium">{teacher.school_name || 'មិនមាន'}</p>
                 </div>
                 {/* Add more fields like subjects taught, classes assigned, etc. if available */}
              </div>
              
            </div>

          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">កែប្រែព័ត៌មានគ្រូ</h3>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="updateTeacherForm" onSubmit={handleUpdateSubmit} className="space-y-8">
                
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-lg bg-gray-100">
                      <img 
                        src={previewUrl || `https://ui-avatars.com/api/?name=${updateData.first_name}+${updateData.last_name}`} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg transition-all border-4 border-white">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-3 font-medium">ចុចដើម្បីប្តូររូបភាព</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">នាមត្រកូល <span className="text-red-500">*</span></label>
                    <input type="text" name="last_name" value={updateData.last_name} onChange={handleUpdateChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">នាមខ្លួន <span className="text-red-500">*</span></label>
                    <input type="text" name="first_name" value={updateData.first_name} onChange={handleUpdateChange} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ភេទ</label>
                    <select name="sex" value={updateData.sex} onChange={handleUpdateChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white">
                      <option value="">ជ្រើសរើស</option>
                      <option value="Male">ប្រុស</option>
                      <option value="Female">ស្រី</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ថ្ងៃកំណើត</label>
                    <input type="date" name="date_of_birth" value={updateData.date_of_birth} onChange={handleUpdateChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">លេខទូរស័ព្ទ</label>
                    <input type="tel" name="phone_number" value={updateData.phone_number} onChange={handleUpdateChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ស្ថានភាព</label>
                    <select name="status" value={updateData.status} onChange={handleUpdateChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white">
                      <option value="active">សកម្ម</option>
                      <option value="inactive">អសកម្ម</option>
                      <option value="on_leave">សម្រាកច្បាប់</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">ទីកន្លែងកំណើត</label>
                    <input type="text" name="place_of_birth" value={updateData.place_of_birth} onChange={handleUpdateChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">អាសយដ្ឋានបច្ចុប្បន្ន</label>
                    <textarea name="address" value={updateData.address} onChange={handleUpdateChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">បទពិសោធន៍</label>
                    <textarea name="experience" value={updateData.experience} onChange={handleUpdateChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                disabled={updating}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all disabled:opacity-50"
              >
                បោះបង់
              </button>
              <button 
                type="submit" 
                form="updateTeacherForm"
                disabled={updating}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {updating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                <span>រក្សាទុក</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default TeacherDetailViewPrincipal