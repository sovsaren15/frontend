import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Image as ImageIcon, 
  Loader2, 
  Pencil, 
  X, 
  User,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { request } from '../../util/request';
import toast from 'react-hot-toast';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  const relativePath = normalizedPath.includes('uploads/') ? normalizedPath.substring(normalizedPath.indexOf('uploads/')) : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const EventViewdetailPrincipalPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Update Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    map_link: "",
    start_date: "",
    end_date: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Image Viewer State
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState([]);

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const res = await request(`/events/${eventId}`, 'GET');
      setEvent(res.data || res);
    } catch (error) {
      console.error("Failed to fetch event", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEvent().finally(() => setLoading(false));
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openImageViewer = (images, index = 0) => {
    setViewerImages(images);
    setCurrentImageIndex(index);
    setIsViewerOpen(true);
  };

  const openUpdateModal = () => {
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const pad = (num) => num.toString().padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    setFormData({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      map_link: event.map_link || "",
      start_date: formatDateForInput(event.start_date),
      end_date: formatDateForInput(event.end_date),
    });

    let imgs = [];
    if (event.image) {
      try {
        const parsed = JSON.parse(event.image);
        imgs = Array.isArray(parsed) ? parsed : [event.image];
      } catch (e) {
        imgs = [event.image];
      }
    }
    setExistingImages(imgs);
    setIsUpdateModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date || !formData.end_date) {
      toast.error("សូមបំពេញព័ត៌មានដែលត្រូវការទាំងអស់។");
      return;
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error("កាលបរិច្ឆេទបញ្ចប់ត្រូវតែនៅក្រោយកាលបរិច្ឆេទចាប់ផ្តើម។");
      return;
    }

    setSubmitLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("map_link", formData.map_link);
      data.append("start_date", formData.start_date.replace("T", " ").substring(0, 16) + ":00");
      data.append("end_date", formData.end_date.replace("T", " ").substring(0, 16) + ":00");

      data.append("existing_images", JSON.stringify(Array.isArray(existingImages) ? existingImages : []));
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => data.append("images", file));
      }

      await request(`/events/${eventId}`, "PUT", data);
      toast.success("ព្រឹត្តិការណ៍ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!");
      setIsUpdateModalOpen(false);
      fetchEvent();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការរក្សាទុកព្រឹត្តិការណ៍។");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 font-kantumruy">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 font-kantumruy">
        <div className="text-center">
            <h2 className="text-xl font-bold text-gray-700">រកមិនឃើញព្រឹត្តិការណ៍</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">ត្រឡប់ក្រោយ</button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('km-KH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10 font-kantumruy">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ================= HEADER (KEPT EXACTLY AS REQUESTED) ================= */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </span>
              ព័ត៌មានលម្អិតព្រឹត្តិការណ៍
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              មើលព័ត៌មានលម្អិតអំពីព្រឹត្តិការណ៍
            </p>
          </div>
          <button
            onClick={openUpdateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Pencil size={20} />
            <span>កែប្រែព្រឹត្តិការណ៍</span>
          </button>
        </div>
        {/* ================= END HEADER ================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Main Content (Images & Description) */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Title & Image Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                        {event.title}
                    </h1>

                    {/* Image Display */}
                    <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                        {(() => {
                        let images = [];
                        if (event.image) {
                            try {
                                const parsed = JSON.parse(event.image);
                                images = Array.isArray(parsed) ? parsed : [event.image];
                            } catch (e) {
                                images = [event.image];
                            }
                        }

                        if (images.length > 0) {
                            if (images.length === 1) {
                                return (
                                    <div className="cursor-pointer" onClick={() => openImageViewer(images, 0)}>
                                        <img
                                            src={getImageUrl(images[0])}
                                            alt={event.title}
                                            className="w-full h-auto object-cover max-h-[500px]"
                                        />
                                    </div>
                                );
                            }
                            
                            const displayImages = images.slice(0, 4);
                            return (
                                <div className="grid grid-cols-2 gap-2 p-2">
                                    {displayImages.map((img, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`relative rounded-xl overflow-hidden shadow-sm cursor-pointer group ${displayImages.length === 3 && idx === 0 ? 'col-span-2 h-80' : 'h-48'}`}
                                            onClick={() => openImageViewer(images, idx)}
                                        >
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${event.title} ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {idx === 3 && images.length > 4 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] group-hover:bg-black/60 transition-colors">
                                                    <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        }

                        return (
                            <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
                                <ImageIcon size={48} className="mb-2 opacity-50" />
                                <p>គ្មានរូបភាព</p>
                            </div>
                        );
                        })()}
                    </div>
                </div>

                {/* Description Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                        អំពីព្រឹត្តិការណ៍
                    </h3>
                    <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-justify">
                        {event.description || <span className="italic text-gray-400">មិនមានការពិពណ៌នា...</span>}
                    </div>
                </div>
            </div>

            {/* Right Column: Sidebar (Date, Location, Organizer) */}
            <div className="space-y-6">
                
                {/* Date & Time Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">កាលបរិច្ឆេទ & ម៉ោង</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">កាលបរិច្ឆេទ</p>
                                <p className="text-gray-900 font-medium text-sm">
                                    {formatDate(event.start_date)}
                                </p>
                                {new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString() && (
                                    <p className="text-gray-900 font-medium text-sm mt-1">
                                        ដល់ {formatDate(event.end_date)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">ម៉ោង</p>
                                <p className="text-gray-900 font-medium text-sm">
                                    {formatTime(event.start_date)} - {formatTime(event.end_date)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">ទីតាំង</h3>
                    <div className="flex items-start gap-4 mb-5">
                         <div className="p-2.5 bg-red-50 text-red-600 rounded-xl shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-gray-900 font-medium text-sm leading-relaxed">
                                {event.location || 'មិនមានទីតាំង'}
                            </p>
                        </div>
                    </div>
                    {event.map_link && (
                        <a 
                            href={event.map_link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors text-sm border border-gray-200"
                        >
                            <ExternalLink size={16} />
                            មើលទីតាំងលើផែនទី
                        </a>
                    )}
                </div>

                {/* Organizer Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-gray-900 font-bold text-lg mb-4">អ្នករៀបចំ</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">គណៈគ្រប់គ្រងសាលា</p>
                            <p className="text-xs text-gray-500">សាលាបឋមសិក្សា</p>
                        </div>
                    </div>
                </div>
                
                {/* Back Button (Mobile safe) */}
                 <button 
                    onClick={() => navigate(-1)}
                    className="w-full py-3 rounded-2xl border border-gray-300 text-gray-600 font-medium hover:bg-white hover:shadow-sm transition-all flex items-center justify-center gap-2"
                 >
                    <ArrowLeft size={18} />
                    ត្រឡប់ក្រោយ
                 </button>

            </div>
        </div>
      </div>

      {/* UPDATE MODAL (Styled to match new aesthetic) */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">កែប្រែព័ត៌មានព្រឹត្តិការណ៍</h3>
                <button 
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Form Fields */}
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ចំណងជើងព្រឹត្តិការណ៍ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="ចំណងជើង"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ទីតាំង
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="ទីតាំង"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        តំណភ្ជាប់ផែនទី
                      </label>
                      <input
                        type="text"
                        name="map_link"
                        value={formData.map_link}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="Map Link"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ចាប់ផ្តើម
                      </label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        បញ្ចប់
                      </label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ពិពណ៌នា
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                      placeholder="ពិពណ៌នាអំពីព្រឹត្តិការណ៍..."
                    />
                  </div>
                </div>

                {/* Right Column: Image Upload */}
                <div className="w-full lg:w-80 shrink-0">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    រូបភាព <span className="text-red-500">*</span>
                  </label>

                  <div className="space-y-4">
                     {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all relative bg-gray-50/50 group">
                      <div className="flex flex-col items-center text-center p-4">
                         <div className="p-2 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                             <ImageIcon className="text-indigo-600" size={20} />
                         </div>
                        <div className="text-gray-900 font-medium text-sm">
                          {imagePreviews.length > 0 || existingImages.length > 0
                            ? "បន្ថែមរូបភាពទៀត"
                            : "ជ្រើសរើសរូបភាព"}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                    </label>

                    {/* Image Previews Grid */}
                    {(imagePreviews.length > 0 || existingImages.length > 0) && (
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {/* Existing Images */}
                        {existingImages.map((img, idx) => (
                          <div
                            key={`exist-${idx}`}
                            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                          >
                            <img
                              src={getImageUrl(img)}
                              alt={`Existing ${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeExistingImage(idx);
                                }}
                                className="bg-white/20 hover:bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full transition-colors"
                                >
                                <X size={16} />
                                </button>
                            </div>
                          </div>
                        ))}

                        {/* New Selected Images */}
                        {imagePreviews.map((preview, idx) => (
                          <div
                            key={`new-${idx}`}
                            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                          >
                            <img
                              src={preview}
                              alt={`New ${idx}`}
                              className="w-full h-full object-cover"
                            />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeNewImage(idx);
                                }}
                                className="bg-white/20 hover:bg-red-500/80 backdrop-blur-sm text-white p-1.5 rounded-full transition-colors"
                                >
                                <X size={16} />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 flex justify-end gap-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all text-sm"
              >
                បោះបង់
              </button>
              <button
                onClick={handleSave}
                disabled={submitLoading}
                className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                {submitLoading && <Loader2 className="animate-spin" size={16} />}
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsViewerOpen(false)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => setIsViewerOpen(false)}>
            <X size={32} />
          </button>
          
          <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {viewerImages.length > 1 && (
              <button 
                className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev === 0 ? viewerImages.length - 1 : prev - 1);
                }}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <img 
              src={getImageUrl(viewerImages[currentImageIndex])} 
              alt={`View ${currentImageIndex + 1}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />

            {viewerImages.length > 1 && (
              <button 
                className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev => prev === viewerImages.length - 1 ? 0 : prev + 1);
                }}
              >
                <ChevronRight size={32} />
              </button>
            )}
            
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/90 font-medium bg-black/50 px-4 py-1 rounded-full backdrop-blur-md">
              {currentImageIndex + 1} / {viewerImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventViewdetailPrincipalPage;