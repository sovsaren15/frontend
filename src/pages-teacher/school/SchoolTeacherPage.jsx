import React, { useState, useEffect } from 'react';
import { request } from '../../util/request';
import { useNavigate } from 'react-router-dom';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building2, 
  Loader2,
  Calendar,
  Info,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const SchoolTeacherPage = () => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setLoading(true);
        const teacherRes = await request('/teachers/me', 'GET');

        if (teacherRes.data && teacherRes.data.school_id) {
          const schoolRes = await request(`/schools/${teacherRes.data.school_id}`, 'GET');
          if (schoolRes.data) {
            setSchool(schoolRes.data);
          }
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
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft size={20} />
              <span>ត្រឡប់ក្រោយ</span>
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
    </div>
  );
};

export default SchoolTeacherPage;