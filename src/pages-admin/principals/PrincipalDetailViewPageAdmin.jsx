import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import { User, Mail, Phone, Briefcase, MapPin, Award, Activity, Calendar } from 'lucide-react';

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

    if (loading) {
        return <div className="p-8 text-center">Loading principal details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!principalData) {
        return <div className="p-8 text-center">No principal data found.</div>;
    }

    const fullName = `${principalData.first_name || ''} ${principalData.last_name || ''}`.trim();

    return (
        <div className="p-6 min-h-screen">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold text-2xl">
                                {principalData.first_name?.[0] || ''}{principalData.last_name?.[0] || ''}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{fullName}</h1>
                            <p className="text-sm text-gray-500">ID: {principalData.id}</p>
                        </div>
                        <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            principalData.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {principalData.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                        </span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">ព័ត៌មានទំនាក់ទំនង</h3>
                            <DetailItem icon={<Mail size={18} />} label="អ៊ីមែល" value={principalData.email} />
                            <DetailItem icon={<Phone size={18} />} label="លេខទូរស័ព្ទ" value={principalData.phone_number || 'N/A'} />
                            <DetailItem icon={<MapPin size={18} />} label="អាសយដ្ឋាន" value={principalData.address || 'N/A'} />
                        </div>

                        {/* Professional Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">ព័ត៌មានអាជីព</h3>
                            <DetailItem icon={<Briefcase size={18} />} label="សាលាដែលចាត់តាំង" value={principalData.school_name || <span className="italic text-gray-500">មិនទាន់ចាត់តាំង</span>} />
                            <DetailItem icon={<Award size={18} />} label="បទពិសោធន៍" value={principalData.experience ? `${principalData.experience} ឆ្នាំ` : 'N/A'} />
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
                            <DetailItem icon={<User size={18} />} label="ទីកន្លែងកំណើត" value={principalData.place_of_birth || 'N/A'} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t border-gray-200">
                    <button
                        onClick={handleBack}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                        ត្រឡប់ក្រោយ
                    </button>
                    <button
                        onClick={handleEdit}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        កែសម្រួល
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 text-gray-500 mt-1 mr-3">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-base font-medium text-gray-800">{value}</p>
        </div>
    </div>
);

export default PrincipalDetailViewPageAdmin;