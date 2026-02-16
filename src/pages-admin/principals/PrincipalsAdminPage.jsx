import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { request } from "../../util/request";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import { User, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const PrincipalsAdminPage = () => {
    const [principals, setPrincipals] = useState([]);
    const [filteredPrincipals, setFilteredPrincipals] = useState([]);
    const [totalPrincipals, setTotalPrincipals] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('active'); // Default to active
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch all principals from API
    const fetchPrincipals = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await request('/principals', 'GET');
            const data = response.data.data || [];
            setPrincipals(data);
            setFilteredPrincipals(data);
            setTotalPrincipals(data.length);
        } catch (error) {
            setError(error);
            console.error('Error fetching principals:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchPrincipals();
    }, [fetchPrincipals]);

    // Filter principals based on search term and status
    useEffect(() => {
        let filtered = [...principals];

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(principal => {
                const firstName = (principal.first_name || '').toLowerCase();
                const lastName = (principal.last_name || '').toLowerCase();
                const fullName = `${firstName} ${lastName}`;
                const email = (principal.email || '').toLowerCase();
                const id = String(principal.id || '');
                const schoolName = (principal.school_name || '').toLowerCase();

                return (
                    firstName.includes(search) ||
                    lastName.includes(search) ||
                    fullName.includes(search) ||
                    email.includes(search) ||
                    id.includes(search) ||
                    schoolName.includes(search)
                );
            });
        }

        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter(principal => principal.status === statusFilter);
        }

        setFilteredPrincipals(filtered);
    }, [searchTerm, statusFilter, principals]);

    const handleDelete = async (id) => {
        if (window.confirm("តើអ្នកពិតជាចង់លុបអ្នកគ្រប់គ្រងនេះមែនទេ?")) {
            try {
                await request(`/principals/${id}`, 'DELETE');
                // Remove from state
                setPrincipals(prev => prev.filter(principal => principal.id !== id));
                setTotalPrincipals(prev => Math.max(0, prev - 1));
                toast.success("លុបអ្នកគ្រប់គ្រងបានជោគជ័យ");
            } catch (error) {
                setError(error);
                toast.error(error.response?.data?.message || "បរាជ័យក្នុងការលុបអ្នកគ្រប់គ្រង");
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filters = [
        { label: 'សកម្ម', value: 'active' },
        { label: 'អសកម្ម', value: 'inactive' },
        { label: 'ទាំងអស់', value: 'all' }
    ];

    const getStatusText = (status) => {
        if (status === 'active') return 'សកម្ម';
        if (status === 'inactive') return 'អសកម្ម';
        return status;
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50/50 font-kantumruy">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* HEADER */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <User className="w-6 h-6" />
                            </span>
                            គ្រប់គ្រងអ្នកគ្រប់គ្រង
                        </h1>
                        <p className="text-gray-500 mt-1 ml-11">
                            មើលនិងគ្រប់គ្រងនាយកសាលាទាំងអស់នៅក្នុងប្រព័ន្ធ
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/admin/principals/create"
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-sm hover:shadow-md"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>បន្ថែមអ្នកគ្រប់គ្រង</span>
                        </Link>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
                    <div className="relative flex-1 group ">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="ស្វែងរកតាមឈ្មោះ, ID, ឬអ៊ីមែល..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                        />
                    </div>
                    
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-between gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm min-w-[200px]"
                        >
                            <div className="flex items-center gap-2">
                                <Filter size={18} className="text-gray-400" />
                                <span>{filters.find(f => f.value === statusFilter)?.label || 'ទាំងអស់'}</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-full min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                {filters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => {
                                            setStatusFilter(filter.value);
                                            setIsFilterOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 flex items-center gap-2 ${
                                            statusFilter === filter.value ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {statusFilter === filter.value && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                        <h2 className="text-lg font-bold text-gray-800">បញ្ជីអ្នកគ្រប់គ្រង</h2>
                        <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                            សរុប: {filteredPrincipals.length}
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">អ្នកប្រើប្រាស់</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ឈ្មោះសាលា</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">លេខទំនាក់ទំនង</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">បទពិសោធន៍</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ស្ថានភាព</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">សកម្មភាព</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-100 border-t-indigo-600 mb-4"></div>
                                                <span className="text-gray-500 font-medium">កំពុងផ្ទុកទិន្នន័យ...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20">
                                            <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block">
                                                <p className="font-bold">Error loading data</p>
                                                <p className="text-sm mt-1">{error.message}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPrincipals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3">
                                                    <User className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <p className="font-medium">មិនមានទិន្នន័យ</p>
                                                {(searchTerm || statusFilter !== 'all') && (
                                                    <p className="text-sm mt-1 text-gray-400">សូមព្យាយាមស្វែងរកឬប្តូរតម្រង</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPrincipals.map(principal => (
                                        <tr key={principal.id} className="hover:bg-indigo-50/30 transition duration-150 group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-indigo-100 shadow-sm group-hover:border-indigo-200 transition-colors">
                                                        {principal.image_profile ? (
                                                            <img 
                                                                src={getImageUrl(principal.image_profile)} 
                                                                alt="Profile" 
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${principal.first_name}+${principal.last_name}&background=6366f1&color=fff`; }}
                                                            />
                                                        ) : (
                                                            <span className="text-indigo-600 font-bold text-sm">
                                                                {principal.first_name?.[0]}{principal.last_name?.[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                            {principal.first_name} {principal.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {principal.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    {principal.school_name ? (
                                                        <span className="font-medium">{principal.school_name}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">មិនទាន់ចាត់តាំង</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-emerald-500">📞</span> 
                                                        <span className="font-medium text-xs">{principal.phone_number || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-blue-500">✉️</span> 
                                                        <span className="truncate max-w-[150px] text-xs" title={principal.email}>{principal.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {principal.experience ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                                        {principal.experience} ឆ្នាំ
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    principal.status === 'active' 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        principal.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                                                    }`}></span>
                                                    {getStatusText(principal.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link 
                                                        to={`/admin/principals/${principal.id}`}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="មើលលម្អិត"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link 
                                                        to={`/admin/principals/update/${principal.id}`}
                                                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="កែសម្រួល"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(principal.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="លុប"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalsAdminPage;