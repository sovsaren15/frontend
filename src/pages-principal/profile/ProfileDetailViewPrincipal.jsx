import React, { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Phone,
  Mail,
  MapPin,
  User,
  Edit,
  Camera,
  Calendar,
  Briefcase,
  Award,
  Map,
  Home,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { request } from "../../util/request";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const relativePath = normalizedPath.includes("uploads/")
    ? normalizedPath.substring(normalizedPath.indexOf("uploads/"))
    : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const ProfileDetailViewPrincipal = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    place_of_birth: "",
    date_of_birth: "",
    sex: "",
    experience: "",
    status: "active",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await request("/principals/me", "GET");
      const data = res.data || res;
      setProfile(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        place_of_birth: data.place_of_birth || "",
        date_of_birth: data.date_of_birth
          ? new Date(data.date_of_birth).toISOString().split("T")[0]
          : "",
        sex: data.sex || "",
        experience: data.experience || "",
        status: data.status || "active",
      });
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការទាញយកព័ត៌មានគណនី");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = new FormData();
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("phone_number", formData.phone_number);
      data.append("address", formData.address);
      data.append("place_of_birth", formData.place_of_birth);
      data.append("date_of_birth", formData.date_of_birth);
      data.append("sex", formData.sex);
      data.append("experience", formData.experience);

      if (selectedFile) {
        data.append("image_profile", selectedFile);
      }

      await request("/principals/me", "PUT", data);
      toast.success("កែប្រែព័ត៌មានជោគជ័យ");
      setIsEditing(false);
      setSelectedFile(null);
      fetchProfile();
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការកែប្រែព័ត៌មាន");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        place_of_birth: profile.place_of_birth || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString().split("T")[0]
          : "",
        sex: profile.sex || "",
        experience: profile.experience || "",
        status: profile.status || "active",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Helper Input Component for Clean Style
  const InfoField = ({
    label,
    icon: Icon,
    value,
    isEditing,
    name,
    type = "text",
    onChange,
    options,
    placeholder,
  }) => {
    return (
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          {Icon && <Icon size={14} className="text-indigo-500" />}
          {label}
        </label>

        {isEditing ? (
          options ? (
            <select
              name={name}
              value={value}
              onChange={onChange}
              className="w-full px-4 py-2.5 rounded-xl border-none ring-1 ring-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-xl border-none ring-1 ring-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-gray-400"
            />
          )
        ) : (
          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 font-medium min-h-[46px] flex items-center">
            {value || (
              <span className="text-gray-400 italic text-sm">
                មិនមានទិន្នន័យ
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-kantumruy">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <User size={24} />
              </div>
              ប្រវត្តិរូបផ្ទាល់ខ្លួន
            </h1>
            <p className="text-gray-500 mt-1 ml-1">
              គ្រប់គ្រងព័ត៌មាន និងគណនីនាយករបស់អ្នក
            </p>
          </div>

          {!isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                កែប្រែព័ត៌មាន
              </button>
                            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                <ArrowLeft size={20} />
                <span>ត្រឡប់ក្រោយ</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                ធ្វើឡើងវិញ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                រក្សាទុក
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Card (Sticky) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center sticky top-8">
              <div className="relative inline-block mb-6">
                <div className="w-40 h-40 rounded-full p-1 border-2 border-dashed border-gray-200">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50">
                    {selectedFile ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={
                          getImageUrl(profile?.image_profile) ||
                          `https://ui-avatars.com/api/?name=${profile?.last_name}+${profile?.first_name}&background=random`
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=Principal&background=random`;
                        }}
                      />
                    )}
                  </div>
                </div>

                {isEditing && (
                  <label className="absolute bottom-1 right-1 p-2.5 bg-white border border-gray-200 text-indigo-600 rounded-full cursor-pointer hover:bg-indigo-50 shadow-md transition-all">
                    <Camera size={18} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.last_name} {profile?.first_name}
              </h2>
              <p className="text-gray-500 font-medium text-sm mb-6">
                {profile?.email}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                  នាយកសាលា
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${formData.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}
                >
                  {formData.status === "active" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {formData.status === "active" ? "សកម្ម" : "អសកម្ម"}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-6 grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    បទពិសោធន៍
                  </p>
                  <p className="font-semibold text-gray-900">
                    {profile?.experience ? `${profile.experience} ឆ្នាំ` : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    កាលបរិច្ឆេទ
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information Forms */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <User size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ព័ត៌មានផ្ទាល់ខ្លួន
                </h3>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  label="នាមត្រកូល"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
                <InfoField
                  label="នាមខ្លួន"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
                <InfoField
                  label="ភេទ"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  isEditing={isEditing}
                  options={[
                    { value: "", label: "ជ្រើសរើសភេទ" },
                    { value: "ប្រុស", label: "ប្រុស" },
                    { value: "ស្រី", label: "ស្រី" },
                  ]}
                />
                <InfoField
                  label="ថ្ងៃខែឆ្នាំកំណើត"
                  name="date_of_birth"
                  type="date"
                  icon={Calendar}
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
                <div className="md:col-span-2">
                  <InfoField
                    label="ទីកន្លែងកំណើត"
                    name="place_of_birth"
                    icon={Map}
                    value={formData.place_of_birth}
                    onChange={handleChange}
                    isEditing={isEditing}
                    placeholder="ភូមិ, ឃុំ, ស្រុក, ខេត្ត"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Professional Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Briefcase size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  ការងារ និង ទំនាក់ទំនង
                </h3>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                  label="បទពិសោធន៍ (ឆ្នាំ)"
                  name="experience"
                  type="number"
                  icon={Award}
                  value={formData.experience}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
                <InfoField
                  label="លេខទូរស័ព្ទ"
                  name="phone_number"
                  type="tel"
                  icon={Phone}
                  value={formData.phone_number}
                  onChange={handleChange}
                  isEditing={isEditing}
                />
                <div className="md:col-span-2">
                  <InfoField
                    label="អ៊ីមែល (មិនអាចកែប្រែបាន)"
                    name="email"
                    icon={Mail}
                    value={formData.email}
                    isEditing={false} // Always false for email
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Home size={14} className="text-indigo-500" />
                      អាសយដ្ឋានបច្ចុប្បន្ន
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border-none ring-1 ring-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none resize-none"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-800 font-medium min-h-[80px]">
                        {formData.address || (
                          <span className="text-gray-400 italic text-sm">
                            មិនមានទិន្នន័យ
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  រក្សាទុកការផ្លាស់ប្តូរ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetailViewPrincipal;
