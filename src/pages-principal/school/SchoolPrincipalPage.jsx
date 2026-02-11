import React, { useState, useEffect } from 'react';
import { request } from '../../util/request';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building2, 
  Loader2,
  Edit,
  X,
  Save,
  Upload,
  Calendar,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const SchoolPrincipalPage = () => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setLoading(true);
        const res = await request('/schools', 'GET');
        
        let schoolData = null;
        if (res.data && Array.isArray(res.data)) {
          schoolData = res.data[0];
        } else if (Array.isArray(res)) {
          schoolData = res[0];
        } else if (res.data) {
           schoolData = res.data;
        }

        if (schoolData) {
            setSchool(schoolData);
        }
      } catch (error) {
        console.error("Error fetching school info:", error);
        toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានសាលា");
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, []);

  const handleEditClick = () => {
    setFormData({
      name: school.name || '',
      address: school.address || '',
      phone_number: school.phone_number || '',
      email: school.email || '',
      website: school.website || '',
      description: school.description || '',
      founded_date: school.founded_date ? new Date(school.founded_date).toISOString().split('T')[0] : ''
    });
    setSelectedLogo(null);
    setSelectedCover(null);
    setLogoPreview(school.logo ? getImageUrl(school.logo) : null);
    setCoverPreview(school.cover ? getImageUrl(school.cover) : null);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      if (type === 'logo') {
        setSelectedLogo(file);
        setLogoPreview(preview);
      } else {
        setSelectedCover(file);
        setCoverPreview(preview);
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (selectedLogo) data.append('logo', selectedLogo);
      if (selectedCover) data.append('cover', selectedCover);

      await request(`/schools/${school.id}`, 'PUT', data);
      
      const res = await request(`/schools/${school.id}`, 'GET');
      setSchool(res.data || res);
      toast.success("ព័ត៌មានសាលាត្រូវបានកែប្រែជោគជ័យ");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការកែប្រែព័ត៌មានសាលា");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center text-gray-500">
          <School size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">រកមិនឃើញព័ត៌មានសាលា</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10 font-kantumruy">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= HEADER (UNCHANGED) ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Building2 className="text-indigo-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ព័ត៌មានទូទៅសាលា</h1>
                <p className="text-sm text-gray-500 mt-0.5">មើលព័ត៌មានលម្អិតអំពីសាលារៀនរបស់អ្នក</p>
              </div>
            </div>
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Edit size={18} />
              <span>កែប្រែព័ត៌មាន</span>
            </button>
          </div>
        </div>
        {/* ================= END HEADER ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Profile Card (Takes up 4 cols on large screens) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {/* Decorative Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/5 pointer-events-none z-10" />
              
              {/* Cover Image */}
              <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                {school.cover ? (
                  <img 
                    src={getImageUrl(school.cover)} 
                    alt="Cover" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-300">
                    <Building2 size={48} className="opacity-50" />
                  </div>
                )}
              </div>

              {/* Logo & Identity */}
              <div className="px-6 pb-8 relative z-20">
                <div className="flex flex-col items-center -mt-16">
                  {/* Floating Logo */}
                  <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg ring-4 ring-white/50 backdrop-blur-sm">
                    {school.logo ? (
                      <img 
                        src={getImageUrl(school.logo)} 
                        alt={school.name} 
                        className="w-full h-full object-cover rounded-full bg-white" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-full border border-gray-100">
                        <School size={40} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Name & Badge */}
                  <div className="mt-4 text-center w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {school.name}
                    </h2>
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mt-1">
                       <Calendar size={12} />
                       <span>
                        {school.founded_date 
                          ? `បង្កើត: ${new Date(school.founded_date).toLocaleDateString()}` 
                          : 'មិនមានថ្ងៃបង្កើត'}
                       </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Info & Description (Takes up 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Contact Grid Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Info size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ព័ត៌មានទំនាក់ទំនង</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-red-500 group-hover:scale-110 transition-transform">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">អាសយដ្ឋាន</p>
                        <p className="text-gray-900 font-medium text-sm leading-snug">
                            {school.address || 'មិនមានអាសយដ្ឋាន'}
                        </p>
                    </div>
                </div>

                {/* Phone Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-green-500 group-hover:scale-110 transition-transform">
                        <Phone size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">លេខទូរស័ព្ទ</p>
                        <p className="text-gray-900 font-medium text-sm">
                            {school.phone_number || '--- --- ---'}
                        </p>
                    </div>
                </div>

                {/* Email Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-500 group-hover:scale-110 transition-transform">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">អ៊ីមែល</p>
                        <p className="text-gray-900 font-medium text-sm break-all">
                            {school.email || 'មិនមានអ៊ីមែល'}
                        </p>
                    </div>
                </div>

                {/* Website Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-purple-500 group-hover:scale-110 transition-transform">
                        <Globe size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">គេហទំព័រ</p>
                        {school.website ? (
                             <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium text-sm hover:underline break-all">
                             {school.website}
                           </a>
                        ) : (
                            <p className="text-gray-400 text-sm">មិនមានគេហទំព័រ</p>
                        )}
                    </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
               <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                 អំពីសាលា
               </h3>
               <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {school.description || 'មិនមានការពិពណ៌នាអំពីសាលានៅឡើយទេ។ សូមចុច "កែប្រែព័ត៌មាន" ដើម្បីបន្ថែមការពិពណ៌នា។'}
                  </p>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Edit Modal (Logic kept same, just minor styling touches) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">កែប្រែព័ត៌មានសាលា</h3>
                <p className="text-sm text-gray-500">ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិត</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <form id="schoolForm" onSubmit={handleUpdateSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Logo សាលា</label>
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 p-1 overflow-hidden bg-gray-50 flex-shrink-0 relative group">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 rounded-full"><School /></div>
                        )}
                         <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center rounded-full transition-all">
                             <Upload className="text-white" size={20} />
                         </div>
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium shadow-sm w-full md:w-auto">
                          <Upload size={16} />
                          <span>ជ្រើសរើសរូបភាព</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                        </label>
                        <p className="text-xs text-gray-400 mt-2">ណែនាំ: រូបភាពការ៉េ (Square), PNG ឬ JPG</p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Upload */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">រូបភាព Cover</label>
                    <div className="space-y-3">
                      <div className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 relative group">
                        {coverPreview ? (
                          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 /></div>
                        )}
                      </div>
                      <label className="cursor-pointer block w-full text-center bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium shadow-sm">
                        <span>ផ្លាស់ប្តូររូប Cover</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ឈ្មោះសាលា <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">លេខទូរស័ព្ទ</label>
                            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">អ៊ីមែល</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">អាសយដ្ឋាន</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">គេហទំព័រ</label>
                            <input type="text" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ថ្ងៃបង្កើតសាលា</label>
                            <input type="date" name="founded_date" value={formData.founded_date} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ការពិពណ៌នា</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none" />
                    </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={updating}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all disabled:opacity-50"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                form="schoolForm"
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {updating ? <><Loader2 className="animate-spin" size={18} /> កំពុងរក្សាទុក...</> : <><Save size={18} /> រក្សាទុក</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolPrincipalPage;