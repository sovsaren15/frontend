import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { request } from "../../util/request";
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

const PrincipalsAdminPage = () => {
    const [principals, setPrincipals] = useState([]);
    const [filteredPrincipals, setFilteredPrincipals] = useState([]);
    const [totalPrincipals, setTotalPrincipals] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

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
        if (statusFilter) {
            filtered = filtered.filter(principal => principal.status === statusFilter);
        }

        setFilteredPrincipals(filtered);
    }, [searchTerm, statusFilter, principals]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this principal?")) {
            try {
                await request(`/principals/${id}`, 'DELETE');
                // Remove from state
                setPrincipals(prev => prev.filter(principal => principal.id !== id));
                setTotalPrincipals(prev => Math.max(0, prev - 1));
            } catch (error) {
                setError(error);
                alert('Failed to delete principal. Please try again.');
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    return (
        <div className="p-6 min-h-screen">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">គ្រប់គ្រងអ្នកគ្រប់គ្រង</h1>
            
            {/* Search and Filter Bar */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="ស្វែងរកតាមឈ្មោះ, ID, ឬអ៊ីមែល..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select 
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">ទាំងអស់</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <Link
                    to="/admin/principals/create"
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition duration-200"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    បន្ថែមអ្នកគ្រប់គ្រង
                </Link>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">បញ្ជីអ្នកគ្រប់គ្រង</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            បង្ហាញ {filteredPrincipals.length} / {totalPrincipals}
                        </span>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">អ្នកប្រើប្រាស់</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ឈ្មោះសាលា</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">លេខទំនាក់ទំនង</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">បទពិសោធន៍</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ស្ថានភាព</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3 text-gray-600">កំពុងផ្ទុក...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10">
                                        <div className="text-red-600">
                                            <p className="font-semibold">Error loading data</p>
                                            <p className="text-sm mt-1">{error.message}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPrincipals.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10">
                                        <div className="text-gray-500">
                                            <p className="font-medium">គ្មានទិន្នន័យ</p>
                                            {(searchTerm || statusFilter) && (
                                                <p className="text-sm mt-1">សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង</p>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPrincipals.map(principal => (
                                    <tr key={principal.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {principal.first_name?.[0] || ''}{principal.last_name?.[0] || ''}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {principal.first_name} {principal.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">ID: {principal.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {principal.school_name || <span className="text-gray-400 italic">Not Assigned</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                <div className="flex items-center mb-1">
                                                    <span className="mr-1">📞</span> 
                                                    <span>{principal.phone_number || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="mr-1">✉️</span> 
                                                    <span className="truncate max-w-xs">{principal.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {principal.experience ? `${principal.experience} ឆ្នាំ` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                principal.status === 'active' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {principal.status === 'active' ? 'សកម្ម' : 'អសកម្ម'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link 
                                                    to={`/admin/principals/${principal.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition duration-150"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link 
                                                    to={`/admin/principals/update/${principal.id}`}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition duration-150"
                                                    title="Update Principal"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(principal.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-150"
                                                    title="Delete Principal"
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
    );
};

export default PrincipalsAdminPage;