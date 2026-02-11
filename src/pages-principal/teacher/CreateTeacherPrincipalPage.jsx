import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, AlertCircle, Upload, X, Image as ImageIcon, User, MapPin, Phone, Mail, Calendar, Briefcase } from 'lucide-react';
import { request } from "./../../util/request";

const CreateTeacherPrincipalPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    place_of_birth: '',
    sex: '',
    date_of_birth: '',
    experience: '',
    status: 'active',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        throw new Error('នាមខ្លួន នាមត្រកូល អ៊ីមែល និងពាក្យសម្ងាត់ ត្រូវបំពេញ។');
      }

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (selectedFile) {
        data.append('image_profile', selectedFile);
      }

      const response = await request("/teachers", "POST", data);

      setSuccessMessage('បង្កើតគ្រូបានជោគជ័យ!');
      setTimeout(() => navigate('/principal/teachers'), 1800);
    } catch (err) {
      setError(err.message || 'មានបញ្ហាក្នុងការបង្កើតគ្រូ។');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-kantumruy">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* ================= HEADER (KEPT EXACTLY AS REQUESTED) ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 rounded-xl">
              <UserPlus className="text-indigo-600" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ចុះឈ្មោះគ្រូថ្មី</h1>
              <p className="text-gray-600 mt-1.5">
                បញ្ចូលព័ត៌មានផ្ទាល់ខ្លួន និងគណនីសម្រាប់គ្រូបង្រៀន
              </p>
            </div>
          </div>
        </div>
        {/* ================= END HEADER ================= */}

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="mt-0.5 flex-shrink-0" size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">✓</span>
            </div>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-12">
            
            {/* 1. Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <User size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">ព័ត៌មានផ្ទាល់ខ្លួន</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    នាមត្រកូល <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                    placeholder="បញ្ចូលនាមត្រកូល"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    នាមខ្លួន <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                    placeholder="បញ្ចូលនាមខ្លួន"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">ភេទ</label>
                  <div className="relative">
                    <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">ជ្រើសរើសភេទ</option>
                        <option value="Male">ប្រុស</option>
                        <option value="Female">ស្រី</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">ថ្ងៃខែឆ្នាំកំណើត</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">ទីកន្លែងកំណើត</label>
                  <input
                    type="text"
                    name="place_of_birth"
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                    placeholder="បញ្ចូលទីកន្លែងកំណើត"
                  />
                </div>

                {/* Profile Image - Modern Upload Area */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">រូបថតផ្ទាល់ខ្លួន</label>
                  <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-100 border-dashed">
                    
                    {/* Preview Box */}
                    <div className="relative w-40 h-40 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 group">
                      {previewUrl ? (
                        <>
                            <img
                            src={previewUrl}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Preview</span>
                            </div>
                        </>
                      ) : (
                        <ImageIcon className="text-gray-300" size={40} />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-center space-y-3 w-full">
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700 font-medium shadow-sm">
                            <Upload size={18} />
                            <span>ជ្រើសរើសរូបភាព</span>
                            <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            />
                        </label>
                        
                        {selectedFile && (
                            <button
                            type="button"
                            onClick={removeFile}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors"
                            >
                            <X size={18} />
                            <span>លុប</span>
                            </button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• ទំហំអតិបរមា 5MB</p>
                        <p>• គាំទ្រឯកសារ JPG, PNG ឬ GIF</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Account & Contact Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                 <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Mail size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-gray-900">គណនី និងទំនាក់ទំនង</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    អ៊ីមែល <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                    placeholder="example@school.com"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">
                    ពាក្យសម្ងាត់ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                    placeholder="••••••••"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">លេខទូរស័ព្ទ</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                    placeholder="012 345 678"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">ស្ថានភាព</label>
                  <div className="relative">
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="active">សកម្ម</option>
                        <option value="inactive">អសកម្ម</option>
                        <option value="on_leave">សម្រាកច្បាប់</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">អាសយដ្ឋាន</label>
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder-gray-400"
                    placeholder="បញ្ចូលអាសយដ្ឋានបច្ចុប្បន្ន..."
                  />
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">បទពិសោធន៍</label>
                  <textarea
                    name="experience"
                    rows={4}
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="ពិពណ៌នាអំពីបទពិសោធន៍បង្រៀន ឬការងារពាក់ព័ន្ធ..."
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/principal/teachers')}
                className="px-8 py-3.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all order-2 sm:order-1"
              >
                បោះបង់
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 hover:-translate-y-0.5 focus:ring-4 focus:ring-indigo-200/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-2 min-w-[180px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>កំពុងរក្សាទុក...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>បង្កើតគ្រូ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeacherPrincipalPage;