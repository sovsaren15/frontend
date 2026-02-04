import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import {request} from "./../../util/request"

const CreateTeacherPrincipalPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    place_of_birth: '',
    sex: '',
    date_of_birth: '',
    experience: '',
    status: 'active', // Default status
    image_profile: '', // For now, a URL or empty
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Basic validation
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
        throw new Error('First name, last name, email, and password are required.');
      }

      const response = await request("/teachers", "POST", formData);
      setSuccessMessage(response.message || 'Teacher created successfully!');
      // Optionally clear form or navigate
      setFormData({
        first_name: '', last_name: '', email: '', password: '', phone_number: '', address: '',
        place_of_birth: '', sex: '', date_of_birth: '', experience: '', status: 'active', image_profile: '',
      });
      setTimeout(() => navigate('/principal/teachers'), 2000); // Navigate back after 2 seconds
    } catch (err) {
      setError(err.message || 'Failed to create teacher.');
      console.error("Error creating teacher:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Add New Teacher
          </h2>
          <button
            onClick={() => navigate('/principal/teachers')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Teachers
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <AlertCircle className="inline w-5 h-5 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Personal Information</div>
          <div className="col-span-1">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
            <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-1">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
            <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-1">
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-1">
            <label htmlFor="place_of_birth" className="block text-sm font-medium text-gray-700">Place of Birth</label>
            <input type="text" id="place_of_birth" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-1">
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
            <select id="sex" name="sex" value={formData.sex} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-span-1">
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div className="col-span-2">
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
            <textarea id="experience" name="experience" rows="3" value={formData.experience} onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div className="col-span-1">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div className="col-span-1">
            <label htmlFor="image_profile" className="block text-sm font-medium text-gray-700">Profile Image URL</label>
            <input type="text" id="image_profile" name="image_profile" value={formData.image_profile} onChange={handleChange}
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="md:col-span-2 flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/principal/teachers')}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <UserPlus className="h-5 w-5 mr-2" />
              )}
              Create Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTeacherPrincipalPage
