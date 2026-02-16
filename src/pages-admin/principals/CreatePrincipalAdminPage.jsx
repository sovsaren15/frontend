import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Briefcase, 
  Award, 
  ArrowLeft, 
  Save, 
  UserPlus,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';

const CreatePrincipalAdminPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    school_id: '',
    place_of_birth: '',
    experience: '',
    status: 'active',
  });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await request('/schools', 'GET');
        setSchools(response.data || []);
      } catch (error) {
        console.error("Failed to fetch schools", error);
        toast.error("Failed to load schools list.");
      }
    };
    fetchSchools();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      return toast.error("សូមបំពេញ នាមត្រកូល, នាមខ្លួន, អ៊ីមែល និង លេខសម្ងាត់");
    }
    
    if (formData.password.length < 6) {
      return toast.error("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួ");
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      if (formData.phone_number) formDataToSend.append('phone_number', formData.phone_number);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.school_id) formDataToSend.append('school_id', formData.school_id);
      if (formData.place_of_birth) formDataToSend.append('place_of_birth', formData.place_of_birth);
      formDataToSend.append('experience', formData.experience || '0');
      formDataToSend.append('status', formData.status);
      
      if (selectedFile) {
        formDataToSend.append('image_profile', selectedFile);
      }
      await request('/principals', 'POST', formDataToSend);
      toast.success('បង្កើតអ្នកគ្រប់គ្រងបានជោគជ័យ');
      navigate('/admin/principals');
    } catch (error) {
      console.error("Failed to create principal", error);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || "បរាជ័យក្នុងការបង្កើតអ្នកគ្រប់គ្រង";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/principals');
  };

  const handleClear = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
      address: '',
      school_id: '',
      place_of_birth: '',
      experience: '',
      status: 'active',
    });
    setImagePreview(null);
    setSelectedFile(null);
    toast.success("ទម្រង់ត្រូវបានសម្អាត");
  };

  return (
    <div className="min-h-screen p-6 font-kantumruy">
      <div className="mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <UserPlus className="w-6 h-6" />
              </span>
              បង្កើតអ្នកគ្រប់គ្រងថ្មី
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              បំពេញព័ត៌មានដើម្បីបង្កើតគណនីអ្នកគ្រប់គ្រងសាលាថ្មី
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold"
            >
              <ArrowLeft size={18} />
              <span>ត្រឡប់ក្រោយ</span>
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-8">
            {/* Profile Image Upload - RECTANGLE STYLE */}
            <div className="flex justify-center mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100 ring-4 ring-indigo-50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 p-2.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-md transition-all hover:scale-110 active:scale-95 border-2 border-white">
                  <Camera size={18} />
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Left Column: Personal & Contact */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                  <User size={20} className="text-indigo-600"/>
                  ព័ត៌មានផ្ទាល់ខ្លួន
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">នាមត្រកូល <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="បញ្ចូលនាមត្រកូល"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">នាមខ្លួន <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="បញ្ចូលនាមខ្លួន"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">លេខទូរស័ព្ទ</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="012 345 678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ទីកន្លែងកំណើត</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="place_of_birth"
                      value={formData.place_of_birth}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="ខេត្ត/ក្រុង..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">អាសយដ្ឋានបច្ចុប្បន្ន</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      placeholder="បញ្ចូលអាសយដ្ឋាន..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column: Account & Professional */}
              <div className="space-y-8">
                
                {/* Account Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-indigo-600"/>
                    ព័ត៌មានគណនី
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">អ៊ីមែល <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="example@school.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">លេខសម្ងាត់ <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Professional Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-indigo-600"/>
                    ព័ត៌មានការងារ
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ចាត់តាំងទៅសាលា</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="school_id"
                        value={formData.school_id}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white appearance-none"
                      >
                        <option value="">-- ជ្រើសរើសសាលា (Optional) --</option>
                        {schools
                          .filter(school => school.director_name === null) // Show only schools without directors
                          .map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                          ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">បង្ហាញតែសាលាដែលមិនទាន់មាននាយកប៉ុណ្ណោះ</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">បទពិសោធន៍ (ឆ្នាំ)</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ស្ថានភាព</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white"
                      >
                        <option value="active">សកម្ម</option>
                        <option value="inactive">អសកម្ម</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={handleClear} 
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                សម្អាត
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'កំពុងរក្សាទុក...' : (
                  <>
                    <Save size={18} />
                    បង្កើតគណនី
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrincipalAdminPage;