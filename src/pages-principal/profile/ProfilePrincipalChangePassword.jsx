import React, { useState } from 'react';
import { request } from "../../util/request";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, Save, Loader2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePrincipalChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("ពាក្យសម្ងាត់ថ្មីមិនដូចគ្នាទេ");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ");
      return;
    }

    setLoading(true);
    try {
      await request('/auth/change-password', 'POST', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      toast.success("ផ្លាស់ប្តូរពាក្យសម្ងាត់ជោគជ័យ");
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "បរាជ័យក្នុងការផ្លាស់ប្តូរពាក្យសម្ងាត់");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-kantumruy">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <KeyRound className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ផ្លាស់ប្តូរពាក្យសម្ងាត់</h1>
              <p className="text-sm text-gray-500 mt-0.5">ការពារគណនីរបស់អ្នកដោយប្រើពាក្យសម្ងាត់ដែលមានសុវត្ថិភាព</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Current Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ពាក្យសម្ងាត់បច្ចុប្បន្ន</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="បញ្ចូលពាក្យសម្ងាត់បច្ចុប្បន្ន"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword.current ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ពាក្យសម្ងាត់ថ្មី</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword.new ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">បញ្ជាក់ពាក្យសម្ងាត់ថ្មី</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មីម្តងទៀត"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword.confirm ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                រក្សាទុកការផ្លាស់ប្តូរ
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePrincipalChangePassword;
