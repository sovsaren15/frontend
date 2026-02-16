import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeft, Save, Building2, User, Phone, Mail, Calendar, GraduationCap, MapPin, Image as ImageIcon, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import toast from 'react-hot-toast';

const CreateSchoolsPageAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    principal_id: '',
    address: '',
    phone_number: '',
    email: '',
    school_level: '',
    logo: null,
    cover: null,
    status: 'active',
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result);
          setFormData(prev => ({ ...prev, logo: reader.result }));
        } else {
          setCoverPreview(reader.result);
          setFormData(prev => ({ ...prev, cover: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      return toast.error("សូមបំពេញ ឈ្មោះសាលា និង អាសយដ្ឋាន");
    }
    setLoading(true);
    try {
      await request('/schools', 'POST', formData);
      toast.success('បង្កើតសាលាបានជោគជ័យ');
      navigate('/admin/schools');
    } catch (error) {
      console.error("Failed to create school", error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការបង្កើតសាលា");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/schools');
  };

  const handleClear = () => {
    setFormData({
      name: '',
      principal_id: '',
      address: '',
      phone_number: '',
      email: '',
      school_level: '',
      logo: null,
      cover: null,
      status: 'active',
    });
    setLogoPreview(null);
    setCoverPreview(null);
    toast.success("ទម្រង់ត្រូវបានសម្អាត");
  };

  return (
    <div className="min-h-screen  p-6 font-kantumruy">
      <div className=" mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <School className="w-6 h-6" />
              </span>
              បង្កើតសាលាថ្មី
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              បំពេញព័ត៌មានដើម្បីចុះឈ្មោះសាលារៀនថ្មីចូលក្នុងប្រព័ន្ធ
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ឈ្មោះសាលា <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="បញ្ចូលឈ្មោះសាលា..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">អាសយដ្ឋាន <span className="text-red-500">*</span></label>
                  <div className="relative">
                     <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                     <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      placeholder="ភូមិ, ឃុំ, ស្រុក, ខេត្ត..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">លេខទូរស័ព្ទ</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="012 345 678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">អ៊ីមែល</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="school@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">ថ្ងៃបង្កើត</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          name="founded_date"
                          value={formData.founded_date || ''}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                        />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">កម្រិតសាលា</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                          name="school_level"
                          value={formData.school_level}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white appearance-none text-sm"
                        >
                          <option value="">ជ្រើសរើស</option>
                          <option value="Kindergarten">មត្តេយ្យ</option>
                          <option value="Primary">បឋមសិក្សា</option>
                          <option value="Secondary">អនុវិទ្យាល័យ</option>
                          <option value="High School">វិទ្យាល័យ</option>
                        </select>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ImageIcon size={18} className="text-indigo-500" />
                    Logo សាលា
                 </label>
                 <div className="relative group w-32 h-32 mx-auto md:mx-0">
                    <div className="w-full h-full rounded-2xl border-4 border-white shadow-md overflow-hidden bg-gray-100 relative">
                       {logoPreview ? (
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                             <ImageIcon size={32} />
                          </div>
                       )}
                       <label htmlFor="logo-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload className="text-white" size={24} />
                       </label>
                    </div>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="hidden"
                    />
                 </div>
                 <p className="text-xs text-gray-400 mt-2 text-center md:text-left">ចុចដើម្បីបញ្ចូល Logo</p>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ImageIcon size={18} className="text-indigo-500" />
                    រូបភាព Cover
                 </label>
                 <div className="relative group w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    {coverPreview ? (
                       <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Upload size={32} className="mb-2" />
                          <span className="text-sm">Upload Cover Image</span>
                       </div>
                    )}
                    <label htmlFor="cover-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                          <Upload size={18} /> ប្តូររូបភាព
                       </span>
                    </label>
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'cover')}
                      className="hidden"
                    />
                 </div>
                 <p className="text-xs text-gray-400 mt-2">ណែនាំ: រូបភាពផ្តេក (Landscape)</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
              >
                សម្អាត
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "កំពុងរក្សាទុក..." : (
                   <>
                      <Save size={18} />
                      បង្កើតសាលា
                   </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchoolsPageAdmin;