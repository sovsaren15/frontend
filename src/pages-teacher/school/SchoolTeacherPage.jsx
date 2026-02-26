import React, { useState, useEffect } from 'react';
import { request } from '../../util/request'; // Adjust path as needed
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
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

// Reusable Info Card Component
const InfoItem = ({ icon: Icon, label, value, colorClass = "text-indigo-600", bgClass = "bg-white" }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
    <div className={`p-3 rounded-xl shadow-sm border border-gray-100 ${bgClass} ${colorClass} group-hover:scale-110 transition-transform shrink-0`}>
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-gray-900 font-medium text-sm leading-snug break-words">
        {value || <span className="text-gray-400 font-normal italic">មិនមានទិន្នន័យ</span>}
      </p>
    </div>
  </div>
);

const SchoolTeacherPage = () => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        setLoading(true);
        // 1. Get Teacher's Info to find the School ID
        const teacherRes = await request('/teachers/me', 'GET');
        
        if (teacherRes.data && teacherRes.data.school_id) {
          // 2. Get School Details
          const schoolRes = await request(`/schools/${teacherRes.data.school_id}`, 'GET');
          if (schoolRes.data) {
            setSchool(schoolRes.data);
          }
        } else {
            // Handle case where teacher isn't assigned to a school yet
            toast.error("គណនីរបស់អ្នកមិនទាន់បានភ្ជាប់ជាមួយសាលាណាមួយឡើយ");
        }
      } catch (error) {
        console.error("Error fetching school info:", error);
        toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានសាលា");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
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
          <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
             <School size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">រកមិនឃើញព័ត៌មានសាលា</h2>
          <p className="text-gray-500">សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធដើម្បីត្រួតពិនិត្យគណនីរបស់អ្នក។</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10 font-kantumruy">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= HEADER (Your Custom Header Style Preserved) ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <Building2 className="text-indigo-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">សាលារៀនរបស់ខ្ញុំ</h1>
                <p className="text-sm text-gray-500 mt-0.5">គ្រប់គ្រងនិងមើលព័ត៌មានលម្អិតសាលារៀន</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/teacher/events')}
                className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <Calendar size={20} />
                <span>ព្រឹត្តិការណ៍</span>
              </button>

                            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                <ArrowLeft size={20} />
                <span>ត្រឡប់ក្រោយ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Profile Card (Updated to Match Admin View) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              
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
                    <img 
                      src={getImageUrl(school.logo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(school.name)}&background=4F46E5&color=fff`} 
                      alt={school.name} 
                      className="w-full h-full object-cover rounded-full bg-white" 
                    />
                  </div>
                  
                  {/* Name & Badge */}
                  <div className="mt-4 text-center w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                      {school.name}
                    </h2>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold border ${
                         school.status === 'active' 
                           ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                           : 'bg-red-50 text-red-700 border-red-200'
                       }`}>
                         {school.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                         {school.status === 'active' ? 'កំពុងដំណើរការ' : 'បានផ្អាក'}
                       </span>

                       {school.school_level && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Layers size={14} />
                          {school.school_level}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium mt-3 border border-gray-100">
                        <Calendar size={12} />
                        <span>
                         {school.founded_date 
                           ? `បង្កើត: ${format(new Date(school.founded_date), 'dd/MM/yyyy')}` 
                           : 'មិនមានថ្ងៃបង្កើត'}
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Stats (Updated Layout) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* General Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                   <Info size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ព័ត៌មានទំនាក់ទំនង</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                   icon={Phone} 
                   label="លេខទូរស័ព្ទ" 
                   value={school.phone_number} 
                   colorClass="text-green-600"
                   bgClass="bg-green-50"
                />
                <InfoItem 
                   icon={Mail} 
                   label="អ៊ីមែល" 
                   value={school.email} 
                   colorClass="text-blue-600"
                   bgClass="bg-blue-50"
                />
                <InfoItem 
                   icon={Globe} 
                   label="គេហទំព័រ" 
                   value={school.website} 
                   colorClass="text-cyan-600"
                   bgClass="bg-cyan-50"
                />
                <div className="md:col-span-2">
                   <InfoItem 
                      icon={MapPin} 
                      label="ទីតាំងសាលា" 
                      value={school.address} 
                      colorClass="text-red-600"
                      bgClass="bg-red-50"
                   />
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <ShieldCheck size={20} />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">ស្ថិតិសាលា</h3>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InfoItem 
                    icon={Users} 
                    label="ចំនួនគ្រូបង្រៀន" 
                    value={school.total_teachers ? `${school.total_teachers} នាក់` : '0 នាក់'} 
                    colorClass="text-indigo-600"
                    bgClass="bg-indigo-50"
                  />
                  <InfoItem 
                    icon={GraduationCap} 
                    label="ចំនួនសិស្ស" 
                    value={school.total_students ? `${school.total_students} នាក់` : '0 នាក់'} 
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50"
                  />
                  <InfoItem 
                    icon={BookOpen} 
                    label="ចំនួនថ្នាក់រៀន" 
                    value={school.total_classes ? `${school.total_classes} ថ្នាក់` : '0 ថ្នាក់'} 
                    colorClass="text-purple-600"
                    bgClass="bg-purple-50"
                  />
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
                    {school.description || 'មិនមានការពិពណ៌នាអំពីសាលានៅឡើយទេ។'}
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