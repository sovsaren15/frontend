import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import { 
  User, Mail, Phone, Briefcase, MapPin, Award, ArrowLeft, Edit, Calendar, GraduationCap, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const PrincipalDetailViewPageAdmin = () => {
    const [principalData, setPrincipalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { principalId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPrincipalDetails = async () => {
            if (!principalId) {
                setLoading(false);
                setError("Principal ID is missing.");
                return;
            }
            setLoading(true);
            try {
                const response = await request(`/principals/${principalId}`, 'GET');
                setPrincipalData(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch principal details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPrincipalDetails();
    }, [principalId]);

    const handleEdit = () => {
        navigate(`/admin/principals/update/${principalId}`);
    };

    const handleBack = () => {
        navigate('/admin/principals');
    };

    const handleDelete = async () => {
        if (window.confirm("តើអ្នកពិតជាចង់លុបអ្នកគ្រប់គ្រងនេះមែនទេ?")) {
            try {
                await request(`/principals/${principalId}`, 'DELETE');
                toast.success("លុបអ្នកគ្រប់គ្រងបានជោគជ័យ");
                navigate('/admin/principals');
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "បរាជ័យក្នុងការលុបអ្នកគ្រប់គ្រង");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 text-center max-w-md">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-xl">!</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={handleBack} className="text-indigo-600 font-medium hover:underline">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!principalData) {
        return <div className="p-8 text-center text-gray-500">No principal data found.</div>;
    }

    const fullName = `${principalData.first_name || ''} ${principalData.last_name || ''}`.trim();
    const initials = `${principalData.first_name?.[0] || ''}${principalData.last_name?.[0] || ''}`;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 font-kantumruy">
            <div className=" mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <User className="w-6 h-6" />
                            </span>
                            ព័ត៌មានលម្អិតនាយកសាលា
                        </h1>
                        <p className="text-gray-500 mt-1 ml-11">
                            មើលព័ត៌មានលម្អិតនិងប្រវត្តិរូបរបស់នាយកសាលា
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
                            onClick={handleBack}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold"
                        >
                            <ArrowLeft size={18} />
                            <span>ត្រឡប់ក្រោយ</span>
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

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    {/* Profile Summary Header */}
                    <div className="px-8 py-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <div className="h-24 w-24 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-3xl shadow-inner border-4 border-white overflow-hidden">
                                {principalData.image_profile ? (
                                    <img 
                                        src={getImageUrl(principalData.image_profile)} 
                                        alt={fullName} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{fullName}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                        principalData.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                        {principalData.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                        ID: {principalData.id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <User className="text-indigo-600" size={20} />
                                    ព័ត៌មានផ្ទាល់ខ្លួន
                                </h3>
                                <div className="space-y-5">
                                    <DetailItem 
                                        icon={<Calendar size={18} />} 
                                        label="ថ្ងៃខែឆ្នាំកំណើត" 
                                        value={principalData.date_of_birth ? format(new Date(principalData.date_of_birth), 'dd/MM/yyyy') : 'N/A'} 
                                    />
                                    <DetailItem 
                                        icon={<User size={18} />} 
                                        label="ភេទ" 
                                        value={principalData.gender || 'N/A'} 
                                    />
                                    <DetailItem 
                                        icon={<MapPin size={18} />} 
                                        label="ទីកន្លែងកំណើត" 
                                        value={principalData.place_of_birth || 'N/A'} 
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Phone className="text-indigo-600" size={20} />
                                    ព័ត៌មានទំនាក់ទំនង
                                </h3>
                                <div className="space-y-5">
                                    <DetailItem 
                                        icon={<Mail size={18} />} 
                                        label="អ៊ីមែល" 
                                        value={principalData.email} 
                                        isEmail
                                    />
                                    <DetailItem 
                                        icon={<Phone size={18} />} 
                                        label="លេខទូរស័ព្ទ" 
                                        value={principalData.phone_number || 'N/A'} 
                                    />
                                    <DetailItem 
                                        icon={<MapPin size={18} />} 
                                        label="អាសយដ្ឋានបច្ចុប្បន្ន" 
                                        value={principalData.address || 'N/A'} 
                                    />
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <Briefcase className="text-indigo-600" size={20} />
                                    ព័ត៌មានការងារ
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
                                    <DetailItem 
                                        icon={<GraduationCap size={18} />} 
                                        label="សាលាដែលចាត់តាំង" 
                                        value={principalData.school_name ? (
                                            <span className="font-semibold text-indigo-600">{principalData.school_name}</span>
                                        ) : (
                                            <span className="italic text-gray-400">មិនទាន់ចាត់តាំង</span>
                                        )} 
                                    />
                                    <DetailItem 
                                        icon={<Award size={18} />} 
                                        label="បទពិសោធន៍" 
                                        value={principalData.experience ? `${principalData.experience} ឆ្នាំ` : 'N/A'} 
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value, isEmail }) => (
    <div className="flex items-start group">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mt-0.5 mr-4">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
            <p className={`text-base text-gray-900 ${isEmail ? 'font-mono text-sm' : 'font-medium'}`}>
                {value}
            </p>
        </div>
    </div>
);

export default PrincipalDetailViewPageAdmin;