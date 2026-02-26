import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { request } from "../../util/request";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const UpdatePrincipalAdminPage = () => {
  const { principalId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '', // Optional: for changing password
    phone_number: '',
    address: '',
    school_id: '',
    place_of_birth: '',
    experience: '',
    status: 'active',
  });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!principalId) {
      toast.error("Principal ID is missing!");
      navigate('/admin/principals');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch principal details and all schools in parallel
        const [principalRes, schoolsRes] = await Promise.all([
          request(`/principals/${principalId}`, 'GET'),
          request('/schools', 'GET')
        ]);

        const principalData = principalRes.data;
        const allSchools = schoolsRes.data || [];

        // The school dropdown should show unassigned schools + the principal's current school
        const availableSchools = allSchools.filter(school => 
          school.director_name === null || school.id === principalData.school_id
        );
        setSchools(availableSchools);

        setFormData({
          first_name: principalData.first_name || '',
          last_name: principalData.last_name || '',
          email: principalData.email || '',
          password: '', // Keep password field empty for security
          phone_number: principalData.phone_number || '',
          address: principalData.address || '',
          school_id: principalData.school_id || '',
          place_of_birth: principalData.place_of_birth || '',
          experience: principalData.experience || '',
          status: principalData.status || 'active',
        });

      } catch (err) {
        setError("Failed to load principal data.");
        toast.error("Failed to load principal data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [principalId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      // Only include the password in the payload if it has been changed
      if (!payload.password) {
        delete payload.password;
      }
      // Convert empty string school_id to null
      payload.school_id = payload.school_id || null;

      await request(`/principals/${principalId}`, 'PUT', payload);
      toast.success('កែប្រែព័ត៌មានអ្នកគ្រប់គ្រងបានជោគជ័យ');
      navigate('/admin/principals');
    } catch (error) {
      console.error("Failed to update principal", error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការកែប្រែព័ត៌មានអ្នកគ្រប់គ្រង");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/principals');
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">កែសម្រួលព័ត៌មានអ្នកគ្រប់គ្រង</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">ព័ត៌មានលម្អិត</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="នាមត្រកូល" name="first_name" value={formData.first_name} onChange={handleInputChange} required />
            <InputField label="នាមខ្លួន" name="last_name" value={formData.last_name} onChange={handleInputChange} required />
            <InputField label="អ៊ីមែល" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                លេខសម្ងាត់ថ្មី (ស្រេចចិត្ត)
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none">
                  {showPassword ? <Eye size={18}/> : <EyeOff size={18}/>}
                </button>
              </div>
            </div>
            <InputField label="លេខទូរស័ព្ទ" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
            <InputField label="ទីកន្លែងកំណើត" name="place_of_birth" value={formData.place_of_birth} onChange={handleInputChange} />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">អាសយដ្ឋាន</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ចាត់តាំងទៅសាលា</label>
              <select name="school_id" value={formData.school_id} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">មិនទាន់ចាត់តាំង</option>
                {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
              </select>
            </div>
            <InputField label="បទពិសោធន៍ (ឆ្នាំ)" name="experience" type="number" value={formData.experience} onChange={handleInputChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ស្ថានភាព</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="active">សកម្ម</option>
                <option value="inactive">អសកម្ម</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button onClick={handleCancel} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">បោះបង់</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការផ្លាស់ប្តូរ'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for input fields
const InputField = ({ label, name, type = 'text', value, onChange, required = false, disabled = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input type={type} name={name} value={value} onChange={onChange} required={required} disabled={disabled} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
  </div>
);

export default UpdatePrincipalAdminPage