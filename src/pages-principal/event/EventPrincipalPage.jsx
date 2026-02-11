import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  MapPin,
  Clock,
  X,
  Image as ImageIcon,
  ChevronRight,
  Filter,
  Eye,
  Upload,
} from "lucide-react";
import { request } from "../../util/request";
import toast from "react-hot-toast";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const relativePath = normalizedPath.includes("uploads/")
    ? normalizedPath.substring(normalizedPath.indexOf("uploads/"))
    : normalizedPath;
  return `http://localhost/primary_school_attendance/${relativePath}`;
};

const EventPrincipalPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [schoolId, setSchoolId] = useState(null);

  // Form State
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
  const [editingId, setEditingId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await request("/events", "GET");
      setEvents(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកព្រឹត្តិការណ៍");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch School ID for creation
  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const res = await request("/schools", "GET");
        if (Array.isArray(res.data) && res.data.length > 0)
          setSchoolId(res.data[0].id);
        else if (res.data && res.data.id) setSchoolId(res.data.id);
        else if (Array.isArray(res) && res.length > 0) setSchoolId(res[0].id);
      } catch (error) {
        console.error("Failed to fetch school ID", error);
      }
    };
    fetchSchool();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកប្រាកដទេថាចង់លុបព្រឹត្តិការណ៍នេះ?")) return;

    try {
      await request(`/events/${id}`, "DELETE");
      toast.success("ព្រឹត្តិការណ៍ត្រូវបានលុបដោយជោគជ័យ");
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការលុបព្រឹត្តិការណ៍");
    }
  };

  // Form Handlers
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      map_link: "",
      start_date: "",
      end_date: "",
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openUpdateModal = (event) => {
    resetForm();
    setEditingId(event.id);

    const formatDate = (dateString) => {
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
      start_date: formatDate(event.start_date),
      end_date: formatDate(event.end_date),
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

      if (editingId) {
        // Update
        await request(`/events/${editingId}`, "PUT", data);
        toast.success("ព្រឹត្តិការណ៍ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ!");
        setIsUpdateModalOpen(false);
      } else {
        // Create
        if (!schoolId) {
          toast.error("បាត់ព័ត៌មានសាលារៀន។");
          return;
        }
        data.append("school_id", schoolId);
        await request("/events", "POST", data);
        toast.success("ព្រឹត្តិការណ៍ត្រូវបានបង្កើតដោយជោគជ័យ!");
        setIsCreateModalOpen(false);
      }
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការរក្សាទុកព្រឹត្តិការណ៍។");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-kantumruy">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ================= HEADER (KEPT EXACTLY AS REQUESTED) ================= */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </span>
              គ្រប់គ្រងព្រឹត្តិការណ៍
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              រៀបចំនិងកំណត់កាលវិភាគសកម្មភាពសាលា
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={20} />
            <span>បង្កើតព្រឹត្តិការណ៍</span>
          </button>
        </div>
        {/* ================= END HEADER ================= */}

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង ឬការពិពណ៌នា..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-medium">
            <Filter size={18} />
            <span>តម្រង</span>
          </button>
        </div>

        {/* Events Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    ព័ត៌មានព្រឹត្តិការណ៍
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    កាលវិភាគ
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    ទីតាំង
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                    សកម្មភាព
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2
                          className="animate-spin text-blue-600"
                          size={32}
                        />
                        <p className="text-gray-500 font-medium">
                          កំពុងផ្ទុកព្រឹត្តិការណ៍...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-4 bg-gray-50 rounded-full">
                          <Calendar className="text-gray-300 w-8 h-8" />
                        </div>
                        <p className="text-gray-900 font-semibold">
                          រកមិនឃើញព្រឹត្តិការណ៍
                        </p>
                        <p className="text-gray-500 text-sm">
                          ព្យាយាមកែសម្រួលការស្វែងរក ឬបន្ថែមព្រឹត្តិការណ៍ថ្មី។
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden shadow-sm">
                            {(() => {
                              let img = event.image;
                              try {
                                const parsed = JSON.parse(event.image);
                                if (Array.isArray(parsed) && parsed.length > 0)
                                  img = parsed[0];
                              } catch (e) {}

                              return img ? (
                                <img
                                  src={getImageUrl(img)}
                                  alt={event.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                  <ImageIcon size={24} />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="pt-1">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-xs font-medium">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2">
                          <span className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                            <Calendar size={12} className="text-blue-500" />
                            {new Date(event.start_date).toLocaleDateString(
                              "km-KH"
                            )}
                          </span>
                          <span className="flex items-center gap-2 text-sm text-gray-500 font-medium pl-1">
                            <Clock size={14} className="text-gray-400" />
                            {new Date(event.start_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {" - "}
                            {new Date(event.end_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {event.location ? (
                          <div className="flex flex-col gap-1.5">
                            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <div className="p-1.5 bg-red-50 text-red-500 rounded-full">
                                <MapPin size={12} />
                              </div>
                              {event.location}
                            </span>
                            {event.map_link && (
                              <a
                                href={event.map_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 font-medium ml-8 transition-colors"
                              >
                                មើលលើផែនទី <ChevronRight size={12} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            មិនបានកំណត់ទីតាំង
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => navigate(`/principal/events/viewdetail/${event.id}`)}
                            className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            title="មើលលម្អិត"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openUpdateModal(event)}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="កែសម្រួល"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="លុប"
                          >
                            <Trash2 size={18} />
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

      {/* CREATE / UPDATE MODAL - STYLED TO MATCH NEW DESIGN */}
      {(isCreateModalOpen || isUpdateModalOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">
                  {isUpdateModalOpen ? 'កែប្រែព្រឹត្តិការណ៍' : 'បង្កើតព្រឹត្តិការណ៍ថ្មី'}
                </h3>
                <button 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsUpdateModalOpen(false);
                  }}
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                      placeholder="បញ្ចូលចំណងជើង..."
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                        placeholder="ទីតាំង..."
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400"
                        placeholder="https://..."
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
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder-gray-400"
                      placeholder="សរសេរការពិពណ៌នាអំពីព្រឹត្តិការណ៍នៅទីនេះ..."
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
                             <Upload className="text-indigo-600" size={20} />
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
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsUpdateModalOpen(false);
                }}
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
    </div>
  );
};

export default EventPrincipalPage;