import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import toast from 'react-hot-toast';

const CreatePrincipalAdminPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    school_id: '',
    place_of_birth: '',
    experience: '',
    status: 'active',
  });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await request('/schools', 'GET');
        setSchools(response.data || []);
      } catch (error) {
        console.error("Failed to fetch schools", error);
        toast.error("Failed to load schools list.");
      }
    };
    fetchSchools();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      return toast.error("Please fill in first name, last name, email, and password.");
    }
    setLoading(true);
    try {
      // Convert empty string school_id to null for the backend
      const payload = {
        ...formData,
        school_id: formData.school_id || null,
      };
      await request('/principals', 'POST', payload);
      toast.success('Principal created successfully!');
      navigate('/admin/principals');
    } catch (error) {
      console.error("Failed to create principal", error);
      toast.error(error.response?.data?.message || "Failed to create principal.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/principals');
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">បង្កើតអ្នកគ្រប់គ្រងថ្មី</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">ព័ត៌មានអ្នកគ្រប់គ្រង</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="នាមត្រកូល" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
            <InputField label="នាមខ្លួន" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
            <InputField label="អ៊ីមែល" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            <InputField label="លេខសម្ងាត់" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
            <InputField label="លេខទូរស័ព្ទ" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
            <InputField label="ទីកន្លែងកំណើត" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} />
          </div>  

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">អាសយដ្ឋាន</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ចាត់តាំងទៅសាលា</label>
              <select
                name="school_id"
                value={formData.school_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">មិនទាន់ចាត់តាំង</option>
                {schools
                  .filter(school => school.director_name === null)
                  .map(school => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
              </select>
            </div>
            <InputField label="បទពិសោធន៍ (ឆ្នាំ)" name="experience" type="number" value={formData.experience} onChange={handleInputChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ស្ថានភាព</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="active">សកម្ម</option>
                <option value="inactive">អសកម្ម</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button onClick={handleCancel} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
              បោះបង់
            </button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'កំពុងរក្សាទុក...' : 'បង្កើតអ្នកគ្រប់គ្រង'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for input fields to reduce repetition
const InputField = ({ label, name, type = 'text', value, onChange, required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default CreatePrincipalAdminPage