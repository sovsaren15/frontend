import React, { useState, useEffect } from "react";
import {
  Loader2,
  Save,
  Phone,
  Mail,
  User,
  Edit,
  Home,
  ArrowLeft,
  ShieldCheck
} from "lucide-react";
import { request } from "../../util/request";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfileDetailViewAdmin = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await request("/auth/validate-token", "GET");
      const data = res.user || res.data?.user || res; 
      
      setProfile(data);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
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

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        address: formData.address,
      };

      const res = await request("/auth/profile", "PUT", payload);
      
      toast.success("កែប្រែព័ត៌មានជោគជ័យ");
      setIsEditing(false);
      
      if (res.user) {
          setProfile(res.user);
      } else {
          fetchProfile();
      }
    } catch (err) {
      console.error(err);
      toast.error("បរាជ័យក្នុងការកែប្រែព័ត៌មាន");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
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

  const InfoField = ({
    label,
    icon: Icon,
    value,
    isEditing,
    name,
    type = "text",
    onChange,
    placeholder,
  }) => {
    return (
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          {Icon && <Icon size={14} className="text-indigo-500" />}
          {label}
        </label>

        {isEditing ? (
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 rounded-xl border-none ring-1 ring-gray-200 bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder-gray-400"
            />
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
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              ប្រវត្តិរូបអ្នកគ្រប់គ្រង
            </h1>
            <p className="text-gray-500 mt-1 ml-1">
              គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក
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
                បោះបង់
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
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center sticky top-8">
              <div className="relative inline-block mb-6">
                <div className="w-40 h-40 rounded-full p-1 border-2 border-dashed border-gray-200">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50">
                    <img
                      src={`https://ui-avatars.com/api/?name=${profile?.last_name}+${profile?.first_name}&background=random&size=256`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.last_name} {profile?.first_name}
              </h2>
              <p className="text-gray-500 font-medium text-sm mb-6">
                {profile?.email}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
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
                <div className="md:col-span-2">
                  <InfoField
                    label="អ៊ីមែល (មិនអាចកែប្រែបាន)"
                    name="email"
                    icon={Mail}
                    value={formData.email}
                    isEditing={false}
                  />
                </div>
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Home size={14} className="text-indigo-500" />
                      អាសយដ្ឋាន
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

export default ProfileDetailViewAdmin;
