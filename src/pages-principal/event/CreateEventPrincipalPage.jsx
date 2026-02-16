import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Save, Loader2, X, Image as ImageIcon, MapPin, Map, ArrowLeft } from 'lucide-react';
import { request } from '../../util/request';
import toast from 'react-hot-toast';

const CreateEventPrincipalPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    map_link: '',
    start_date: '',
    end_date: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await request('/schools', 'GET');
        // Handle array or single object response to get the school ID
        if (Array.isArray(res.data) && res.data.length > 0) {
            setSchoolId(res.data[0].id);
        } else if (res.data && res.data.id) {
            setSchoolId(res.data.id);
        } else if (Array.isArray(res) && res.length > 0) {
             setSchoolId(res[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch school ID", error);
        toast.error("Could not determine school ID.");
      }
    };
    fetchSchool();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolId) {
        toast.error("School information is missing. Please try refreshing the page.");
        return;
    }
    if (!formData.title || !formData.start_date || !formData.end_date) {
        toast.error("Please fill in all required fields.");
        return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
        toast.error("End date must be after start date.");
        return;
    }

    setLoading(true);
    try {
        const data = new FormData();
        data.append('school_id', schoolId);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('location', formData.location);
        data.append('map_link', formData.map_link);
        // Format date for MySQL (YYYY-MM-DD HH:mm:ss)
        data.append('start_date', formData.start_date.replace('T', ' ').substring(0, 16) + ':00'); 
        data.append('end_date', formData.end_date.replace('T', ' ').substring(0, 16) + ':00');
        
        if (selectedFiles.length > 0) {
            selectedFiles.forEach(file => data.append('images', file));
        }

        await request('/events', 'POST', data);
        toast.success("Event created successfully!");
        navigate('/principal/events');
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to create event.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-kantumruy">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-blue-50 rounded-xl">
                <Calendar className="text-blue-600" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                <p className="text-gray-600 mt-1.5">Schedule a new event for your school.</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft size={20} />
              <span>ត្រឡប់ក្រោយ</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Annual Science Fair"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
            </div>

            {/* Location & Map Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. School Hall"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Map Link
                </label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="map_link"
                    value={formData.map_link}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter event details..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Images
              </label>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer relative group">
                <div className="space-y-1 text-center">
                      <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center rounded-full bg-gray-100 mb-3">
                        <ImageIcon size={24} />
                      </div>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>{imagePreviews.length > 0 ? 'Add more images' : 'Upload images'}</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB (Max 10 images)
                      </p>
                </div>
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept="image/*" 
                    multiple
                    onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                    {loading ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        Creating...
                    </>
                    ) : (
                    <>
                        <Save size={20} />
                        Create Event
                    </>
                    )}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPrincipalPage;
