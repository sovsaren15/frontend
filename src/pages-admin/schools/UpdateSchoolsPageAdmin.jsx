import React, { useState, useEffect } from "react";
import { Upload, ChevronDown, Save, ArrowLeft, Building2, User, Phone, Mail, Calendar, GraduationCap, MapPin, Image as ImageIcon, School } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { request } from "../../util/request";
import toast from "react-hot-toast";
import { format } from "date-fns";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("data:")) return imagePath;
  if (imagePath.startsWith("http")) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const relativePath = normalizedPath.includes("uploads/")
    ? normalizedPath.substring(normalizedPath.indexOf("uploads/"))
    : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const UpdateSchoolsPageAdmin = () => {
  const { schoolId: id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    principal_id: "",
    address: "",
    phone_number: "",
    email: "",
    founded_date: "",
    school_level: "",
    status: "active",
    logo: null,
    cover: null,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [principals, setPrincipals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("School ID is missing.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [schoolRes, principalsRes] = await Promise.all([
          request(`/schools/${id}`, "GET"),
          request("/principals/unassigned", "GET"),
        ]);
        const schoolData = schoolRes?.data;
        if (!schoolData) {
          throw new Error("School not found.");
        }

        const unassignedPrincipals = principalsRes?.data || [];
        let allPrincipals = [...unassignedPrincipals];
        
        if (schoolData.principal_id && schoolData.director_name) {
          const currentPrincipalExists = allPrincipals.some(
            (p) => p.id === schoolData.principal_id
          );
          if (!currentPrincipalExists) {
            allPrincipals.unshift({
              id: schoolData.principal_id,
              name: schoolData.director_name,
            });
          }
        }
        setPrincipals(allPrincipals);

        const formattedDate = schoolData.founded_date
          ? format(new Date(schoolData.founded_date), "yyyy-MM-dd")
          : "";

        const dataToSet = {
          ...schoolData,
          founded_date: formattedDate,
          principal_id: schoolData.principal_id ?? "",
        };
        setFormData(dataToSet);
        setInitialData(dataToSet);
        setLogoPreview(getImageUrl(schoolData.logo));
        setCoverPreview(getImageUrl(schoolData.cover));
      } catch (err) {
        toast.error("Failed to load school data.");
        setError(err.message || "An unknown error occurred.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "logo") {
          setLogoPreview(reader.result);
          setFormData((prev) => ({ ...prev, logo: reader.result }));
        } else {
          setCoverPreview(reader.result);
          setFormData((prev) => ({ ...prev, cover: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await request(`/schools/${id}`, "PUT", formData);
      toast.success("កែប្រែព័ត៌មានសាលាបានជោគជ័យ");
      navigate("/admin/schools");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "បរាជ័យក្នុងការកែប្រែព័ត៌មានសាលា");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({ ...prev, status: newStatus }));
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    if (initialData) {
      setFormData(initialData);
      setLogoPreview(getImageUrl(initialData.logo));
      setCoverPreview(getImageUrl(initialData.cover));
      toast.success("ទម្រង់ត្រូវបានសម្អាត");
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
         <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full">
            <div className="text-red-500 text-5xl mb-4">!</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => navigate('/admin/schools')} className="text-indigo-600 font-medium hover:underline">Go Back</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-kantumruy">
      <div className=" mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <School className="w-6 h-6" />
              </span>
              កែសម្រួលព័ត៌មានសាលា
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិត និងស្ថានភាពសាលា
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/schools")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold"
            >
              <ArrowLeft size={18} />
              <span>ត្រឡប់ក្រោយ</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Status Section */}
            <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-end">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium text-sm border ${
                    formData.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formData.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span>
                    {formData.status === "active" ? "កំពុងដំណើរការ" : "ផ្អាកដំណើរការ"}
                  </span>
                  <ChevronDown size={16} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in duration-200">
                    <button
                      type="button"
                      onClick={() => handleStatusChange("active")}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      កំពុងដំណើរការ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange("inactive")}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      ផ្អាកដំណើរការ
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8">
              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ឈ្មោះសាលា</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="បញ្ចូលឈ្មោះសាលា..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">នាយកសាលា</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        name="principal_id"
                        value={formData.principal_id || ""}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white appearance-none"
                      >
                        <option value="">-- ជ្រើសរើសនាយកសាលា --</option>
                        {principals.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">អាសយដ្ឋាន</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                       <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                        placeholder="បញ្ចូលអាសយដ្ឋាន..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">លេខទូរស័ព្ទ</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number || ""}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="012 345 678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">អ៊ីមែល</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                        placeholder="school@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ថ្ងៃបង្កើត</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input
                            type="date"
                            name="founded_date"
                            value={formData.founded_date || ""}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm"
                          />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">កម្រិតសាលា</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select
                            name="school_level"
                            value={formData.school_level || ""}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white appearance-none text-sm"
                          >
                            <option value="">ជ្រើសរើស</option>
                            <option value="Kindergarten">មត្តេយ្យ</option>
                            <option value="Primary">បឋមសិក្សា</option>
                            <option value="Secondary">អនុវិទ្យាល័យ</option>
                            <option value="High School">វិទ្យាល័យ</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* Media Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ImageIcon size={18} className="text-indigo-500" />
                      Logo សាលា
                   </label>
                   <div className="relative group w-32 h-32 mx-auto md:mx-0">
                      <div className="w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 relative">
                         {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                               <ImageIcon size={32} />
                            </div>
                         )}
                         {/* Hover Overlay */}
                         <label htmlFor="logo-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="text-white" size={24} />
                         </label>
                      </div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                        className="hidden"
                      />
                   </div>
                   <p className="text-xs text-gray-400 mt-2 text-center md:text-left">ចុចដើម្បីផ្លាស់ប្តូរ Logo (ណែនាំ: រាងការេ)</p>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <ImageIcon size={18} className="text-indigo-500" />
                      រូបភាព Cover
                   </label>
                   <div className="relative group w-full h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      {coverPreview ? (
                         <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <Upload size={32} className="mb-2" />
                            <span className="text-sm">Upload Cover Image</span>
                         </div>
                      )}
                      <label htmlFor="cover-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <Upload size={18} /> ប្តូររូបភាព
                         </span>
                      </label>
                      <input
                        type="file"
                        id="cover-upload"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cover")}
                        className="hidden"
                      />
                   </div>
                   <p className="text-xs text-gray-400 mt-2">ណែនាំ: រូបភាពផ្តេក (Landscape) សម្រាប់ Cover</p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                >
                  សម្អាត
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "កំពុងរក្សាទុក..." : (
                     <>
                        <Save size={18} />
                        រក្សាទុកការផ្លាស់ប្តូរ
                     </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSchoolsPageAdmin;