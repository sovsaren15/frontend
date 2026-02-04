import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import { format } from 'date-fns';

const SchoolDetailViewPageAdmin = () => {
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { schoolId: id } = useParams(); // Match the route parameter name for consistency
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      // Don't run the fetch if the id from the URL isn't available yet
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await request(`/schools/${id}`, 'GET');
        setSchoolData(data?.data); // Safely access the data property
      } catch (err) {
        setError(err.message || 'Failed to fetch school details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/schools/update/${id}`);
  };

  const handleCancel = () => {
    navigate('/admin/schools');
  };

  if (loading) {
    return <div className="p-8 text-center">Loading school details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!schoolData) {
    return <div className="p-8 text-center">No school data found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Cover and Logo Section */}
        <div className="relative h-48 md:h-64 bg-gray-200">
          <img
            src={schoolData.cover || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop'}
            alt={`${schoolData.name} cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg">
            <img
              src={schoolData.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolData.name)}&background=4F46E5&color=fff`}
              alt={`${schoolData.name} logo`}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white"
            />
          </div>
        </div>

        {/* Header with School Name and Status */}
        <div className="flex flex-col items-center justify-between px-6 pt-16 pb-4 border-b border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-gray-800">{schoolData.name}</h1>
          <span className={`mt-2 px-3 py-1 text-sm rounded-full font-medium ${
            schoolData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {schoolData.status === 'active' ? 'កំពុងដំណើរការ' : 'បានផ្អាក'}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* School Information Section */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-4 border-b pb-2">ព័ត៌មានទូទៅ</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* School Name */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ឈ្មោះសាលា
                </label>
                <p className="text-sm font-medium text-gray-600 px-2">
                  {schoolData.name}
                </p>
              </div>

              {/* Director Name */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  អ្នកគ្រប់គ្រង
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.director_name || 'N/A'}
                </p>
              </div>

              {/* Description */}
              <div className="lg:row-span-2">
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ទីតាំងរបស់សាលា
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.address}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  អ៊ីមែល
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  លេខទូរស័ព្ទ
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.phone_number}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="mb-8">
            <h3 className="text-base font-semibold text-gray-800 mb-4 border-b pb-2">ស្ថិតិ និងព័ត៌មានបន្ថែម</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Founded Date */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ថ្ងៃបង្កើត
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.founded_date ? format(new Date(schoolData.founded_date), 'dd/MM/yyyy') : 'N/A'}
                </p>
              </div>

              {/* School Type */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ប្រភេទសាលា
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {'សាធារណៈ'} {/* This seems to be a static value for now */}
                </p>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  កំរិត
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.school_level || 'N/A'}
                </p>
              </div>

              {/* Total Teachers */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ចំនួនគ្រូ
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.total_teachers}
                </p>
              </div>

              {/* Total Students */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ចំនួនសិស្ស
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.total_students}
                </p>
              </div>

              {/* Total Classes */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ចំនួនថ្នាក់
                </label>
                <p className="text-sm text-gray-600 px-2">
                  {schoolData.total_classes}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-8 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition font-normal"
            >
              បោះបង់
            </button>
            <button
              onClick={handleEdit}
              className="px-8 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-800 transition font-normal"
            >
              កែសម្រួល
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailViewPageAdmin;