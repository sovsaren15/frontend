import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import toast from 'react-hot-toast';

const CreateSchoolsPageAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    principal_id: '',
    address: '',
    phone_number: '',
    email: '',
    school_level: '',
    logo: null,
    cover: null,
    status: 'active', // Default to active
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') {
          setLogoPreview(reader.result);
          setFormData(prev => ({ ...prev, logo: reader.result }));
        } else {
          setCoverPreview(reader.result);
          setFormData(prev => ({ ...prev, cover: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        const data = await request('/principals/unassigned', 'GET');
        setPrincipals(data.data || []); // Correctly access the data array
      } catch (error) {
        console.error("Failed to fetch principals", error);
        toast.error("Failed to load principals list.");
      }
    };
    fetchPrincipals();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.address) {
      return toast.error("Please fill in school name and address.");
    }
    setLoading(true);
    try {
      // The backend now handles principal assignment during creation if principal_id is provided.
      await request('/schools', 'POST', formData);
      toast.success('School created successfully!');
      navigate('/admin/schools');
    } catch (error) {
      console.error("Failed to create school", error);
      toast.error(error.response?.data?.message || "Failed to create school.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/schools');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">បង្កើតសាលាថ្មី</h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">ព័ត៌មានសាលា</h2>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* School Information Section */}
          <div className="mb-1">
            <h3 className="text-base font-semibold text-gray-800 mb-4">ព័ត៌មានទំនាក់ទំនង</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* School Name */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ឈ្មោះសាលា
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

             

              {/* Description */}
              <div className="lg:row-span-2">
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  អាសយដ្ឋាននៃសាលា
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="សាលាអាចមានអាសយដ្ឋានដូចជា ភូមិ, ឃុំ, ស្រុក, ខេត្ត..."
                  rows="6"
                  maxLength="2000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder:text-sm"
                ></textarea>
                <div className="text-right text-xs text-gray-500 mt-1">
                  {formData.address.length}/2000
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  លេខទូរស័ព្ទ
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  អ៊ីមែលរបស់សាលា
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="mb-2">
            <h3 className="text-base font-semibold text-gray-800 mb-4">ព័ត៌មានលម្អិតរបស់សាលា</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Founded Date */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  ថ្ងៃបង្កើត
                </label>
                <input
                  type="date"
                  name="founded_date"
                  value={formData.founded_date || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              

              {/* District/Location */}
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  កំរិតសាលា
                </label>
                <select
                  name="school_level"
                  value={formData.school_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value=""></option>
                  <option value="Kindergarten">មត្តេយ្យ (Kindergarten)</option>
                  <option value="Primary">បឋមសិក្សា (Primary)</option>
                  <option value="Secondary">អនុវិទ្យាល័យ (Secondary)</option>
                  <option value="High School">វិទ្យាល័យ (High School)</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Logo សាលា*
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded p-12 text-center hover:border-gray-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload" className="cursor-pointer block">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-20 h-20 mx-auto rounded object-cover" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">ចុចនៅលើដើម្បីបញ្ចូលរូប</p>
                      <p className="text-xs text-gray-400 mt-1">ទំហំរូប(3*4)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Cover សាលា*
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded p-12 text-center hover:border-gray-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                  className="hidden"
                  id="cover-upload"
                />
                <label htmlFor="cover-upload" className="cursor-pointer block">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover Preview" className="w-full h-20 mx-auto rounded object-cover" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">ចុចនៅលើដើម្បីបញ្ចូលរូប</p>
                      <p className="text-xs text-gray-400 mt-1">ទំហំរូប(4*6)</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-8 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition font-normal"
            >
              បោះបង់
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2 bg-indigo-900 text-white rounded hover:bg-indigo-800 transition font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'កំពុងរក្សាទុក...' : 'បង្កើតសាលាថ្មី'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSchoolsPageAdmin;