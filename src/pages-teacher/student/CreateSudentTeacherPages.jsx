import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2, Save, UserPlus, Calendar, Phone, Mail, MapPin, Lock, User, GraduationCap, Image as ImageIcon } from 'lucide-react';
import { request } from "../../util/request";
import toast from 'react-hot-toast';

const CreateStudentTeacherPages = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
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

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await request('/classes/teacher/me', 'GET');
        const classList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setClasses(classList);
        if (classList.length > 0) {
          setSelectedClass(classList[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("បរាជ័យក្នុងការទាញយកថ្នាក់រៀន");
      }
    };
    fetchClasses();
  }, []);

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

    setLoading(true);
    try {
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

      const res = await request('/students', 'POST', formData);
      const newStudentId = res.id || res.data?.id;

      if (newStudentId) {
        await request(`/classes/${selectedClass}/students`, 'POST', { student_id: newStudentId });
        toast.success("ចុះឈ្មោះសិស្សជោគជ័យ");
        navigate('/teacher/students');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "បរាជ័យក្នុងការចុះឈ្មោះ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  pb-20 font-kantumruy">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <UserPlus className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ចុះឈ្មោះសិស្សថ្មី</h1>
              <p className="text-sm text-gray-500 mt-0.5">បង្កើតគណនីសិស្សនិងបញ្ចូលទៅក្នុងថ្នាក់រៀន</p>
            </div>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          
          <div className="space-y-8">
            
            {/* 1. ព័ត៌មានសិក្សា (Academic Info) */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">ព័ត៌មានសិក្សា</h3>
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ជ្រើសរើសថ្នាក់ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-gray-700"
                  >
                    <option value="">-- សូមជ្រើសរើសថ្នាក់ --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ព័ត៌មានផ្ទាល់ខ្លួន (Personal Info) */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs Column */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">នាមត្រកូល <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="last_name" 
                        value={registerData.last_name} 
                        onChange={handleRegisterChange} 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="នាមត្រកូល" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">នាមខ្លួន <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="first_name" 
                        value={registerData.first_name} 
                        onChange={handleRegisterChange} 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="នាមខ្លួន" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">ថ្ងៃខែឆ្នាំកំណើត</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          name="date_of_birth" 
                          value={registerData.date_of_birth} 
                          onChange={handleRegisterChange} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">ថ្ងៃចូលរៀន</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          name="enrollment_date" 
                          value={registerData.enrollment_date} 
                          onChange={handleRegisterChange} 
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Image Column */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">រូបថត <span className="text-red-500">*</span></label>
                  <label className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all relative overflow-hidden group bg-white">
                    {selectedFile ? (
                      <>
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Preview" 
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium">ផ្លាស់ប្តូររូបភាព</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <div className="p-3 bg-indigo-50 rounded-full mb-3 text-indigo-500">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-indigo-600">ចុចដើម្បីបង្ហោះ</span> ឬ អូសរូបភាពចូល
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (អតិបរមា 5MB)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>

            {/* 3. គណនី និង ទំនាក់ទំនង (Account & Contact) */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider mt-2">គណនី និង ទំនាក់ទំនង</h3>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">អ៊ីមែល <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      name="email" 
                      value={registerData.email} 
                      onChange={handleRegisterChange} 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      placeholder="student@school.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">លេខទំនាក់ទំនង</label>
                    <input 
                      type="tel" 
                      name="phone_number" 
                      value={registerData.phone_number} 
                      onChange={handleRegisterChange} 
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                      placeholder="012 345 678" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">ពាក្យសម្ងាត់ <span className="text-red-500">*</span></label>
                      <input 
                        type="password" 
                        name="password" 
                        value={registerData.password} 
                        onChange={handleRegisterChange} 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="••••••••" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">អាសយដ្ឋាន</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={registerData.address} 
                        onChange={handleRegisterChange} 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                        placeholder="ទីតាំងស្នាក់នៅ..." 
                      />
                   </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-full border border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
              >
                បោះបង់
              </button>
              <button
                onClick={handleRegisterSubmit}
                disabled={loading}
                className="px-8 py-2.5 rounded-full bg-indigo-900 text-white font-bold hover:bg-indigo-800 transition-all shadow-md flex items-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin w-4 h-4" />}
                {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudentTeacherPages;