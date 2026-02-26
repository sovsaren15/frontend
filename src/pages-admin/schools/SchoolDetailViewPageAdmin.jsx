import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  BookOpen, 
  Layers, 
  UserCheck, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  School,
  Trash2,
  Globe,
  Building2,
  GraduationCap
} from 'lucide-react';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

// Reusable component for displaying information clearly
const InfoItem = ({ icon: Icon, label, value, colorClass = "text-indigo-600" }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
    <div className={`p-3 bg-white rounded-xl shadow-sm border border-gray-100 ${colorClass} group-hover:scale-110 transition-transform shrink-0`}>
      <Icon size={20} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-gray-900 font-medium text-sm leading-snug truncate whitespace-normal">
        {value || <span className="text-gray-400 font-normal italic">មិនមានទិន្នន័យ</span>}
      </p>
    </div>
  </div>
);

const SchoolDetailViewPageAdmin = () => {
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { schoolId: id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (schoolData) {
      document.title = `${schoolData.name} | Primary School Attendance`;
    }
  }, [schoolData]);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await request(`/schools/${id}`, 'GET');
        setSchoolData(data?.data);
      } catch (err) {
        setError(err.message || 'បរាជ័យក្នុងការទាញយកព័ត៌មានសាលា។');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, [id]);

  const handleEdit = () => navigate(`/admin/schools/update/${id}`);
  const handleCancel = () => navigate('/admin/schools');
  const handleDelete = async () => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបសាលានេះមែនទេ?')) {
      try {
        await request(`/schools/${id}`, 'DELETE');
        toast.success('លុបសាលាបានជោគជ័យ');
        navigate('/admin/schools');
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'បរាជ័យក្នុងការលុបសាលា');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center font-kantumruy">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium animate-pulse">កំពុងផ្ទុកទិន្នន័យសាលា...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 font-kantumruy">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ</h3>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button
            onClick={handleCancel}
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            ត្រឡប់ក្រោយ
          </button>
        </div>
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 font-kantumruy">
        <div className="text-center text-gray-500">រកមិនឃើញទិន្នន័យសាលាទេ</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 sm:p-6 md:p-8 font-kantumruy pb-20">
      <div className=" mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <School className="w-6 h-6" />
              </span>
              ព័ត៌មានលម្អិតសាលា
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              មើលព័ត៌មានលម្អិតនិងស្ថិតិរបស់សាលា
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-bold shadow-sm hover:shadow-md"
            >
              <Trash2 size={18} />
              <span>លុប</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-sm hover:shadow-md"
            >
              <Edit size={18} />
              <span>កែសម្រួល</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {/* Cover Image */}
              <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                {schoolData.cover ? (
                  <img
                    src={getImageUrl(schoolData.cover)}
                    alt={`${schoolData.name} cover`}
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
                      src={getImageUrl(schoolData.logo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolData.name)}&background=4F46E5&color=fff`}
                      alt={`${schoolData.name} logo`}
                      className="w-full h-full object-cover rounded-full bg-white"
                    />
                  </div>
                  
                  {/* Name & Badge */}
                  <div className="mt-4 text-center w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{schoolData.name}</h2>
                    
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold border ${
                        schoolData.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {schoolData.status === 'active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {schoolData.status === 'active' ? 'កំពុងដំណើរការ' : 'បានផ្អាក'}
                      </span>
                      {schoolData.school_level && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Layers size={14} />
                          {schoolData.school_level}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium mt-3">
                       <Calendar size={12} />
                       <span>
                        {schoolData.founded_date 
                          ? `បង្កើត: ${format(new Date(schoolData.founded_date), 'dd/MM/yyyy')}` 
                          : 'មិនមានថ្ងៃបង្កើត'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Info & Stats */}
          <div className="lg:col-span-8 space-y-6">
            {/* General Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ព័ត៌មានទូទៅ</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={UserCheck} 
                  label="នាយកសាលា" 
                  value={schoolData.director_name} 
                  colorClass="text-purple-500"
                />
                <InfoItem 
                  icon={Mail} 
                  label="អ៊ីមែល" 
                  value={schoolData.email} 
                  colorClass="text-blue-500"
                />
                <InfoItem 
                  icon={Phone} 
                  label="លេខទូរស័ព្ទ" 
                  value={schoolData.phone_number} 
                  colorClass="text-green-500"
                />
                <InfoItem 
                  icon={MapPin} 
                  label="ទីតាំងសាលា" 
                  value={schoolData.address}
                  colorClass="text-red-500"
                />
                {schoolData.website && (
                  <InfoItem 
                    icon={Globe} 
                    label="គេហទំព័រ" 
                    value={schoolData.website}
                    colorClass="text-cyan-500"
                  />
                )}
              </div>
            </div>

            {/* Statistics Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ស្ថិតិសាលា</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoItem 
                  icon={Users} 
                  label="ចំនួនគ្រូបង្រៀន" 
                  value={schoolData.total_teachers ? `${schoolData.total_teachers} នាក់` : '0 នាក់'} 
                  colorClass="text-blue-600"
                />
                <InfoItem 
                  icon={GraduationCap} 
                  label="ចំនួនសិស្ស" 
                  value={schoolData.total_students ? `${schoolData.total_students} នាក់` : '0 នាក់'} 
                  colorClass="text-emerald-600"
                />
                <InfoItem 
                  icon={BookOpen} 
                  label="ចំនួនថ្នាក់រៀន" 
                  value={schoolData.total_classes ? `${schoolData.total_classes} ថ្នាក់` : '0 ថ្នាក់'} 
                  colorClass="text-purple-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailViewPageAdmin;