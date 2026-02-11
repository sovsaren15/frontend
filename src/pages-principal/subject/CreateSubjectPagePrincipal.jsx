import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Save, Loader2, AlertCircle, CheckCircle2, ArrowLeft, GraduationCap } from 'lucide-react';
import { request } from '../../util/request';

const PREDEFINED_SUBJECTS = [
  "ភាសាខ្មែរ",
  "គណិតវិទ្យា",
  "វិទ្យាសាស្ត្រ",
  "ភាសាអង់គ្លេស",
  "សិក្សាសង្គម",
  "អប់រំកាយ",
  "រូបវិទ្យា",
  "គីមីវិទ្យា",
  "ជីវវិទ្យា",
  "ប្រវត្តិវិទ្យា"
];

const CreateSubjectPagePrincipal = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setIsCustom(true);
      setFormData(prev => ({ ...prev, name: '' }));
    } else {
      setIsCustom(false);
      setFormData(prev => ({ ...prev, name: value }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'សូមបញ្ចូលឈ្មោះមុខវិជ្ជា' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await request('/subjects', 'POST', formData);
      setMessage({ type: 'success', text: 'មុខវិជ្ជាត្រូវបានបង្កើតដោយជោគជ័យ!' });
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/principal/subjects');
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'បរាជ័យក្នុងការបង្កើតមុខវិជ្ជា' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-kantumruy">
      <div className=" mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                បង្កើតមុខវិជ្ជាថ្មី
              </h1>
              <p className="text-gray-500 mt-1">បន្ថែមមុខវិជ្ជាថ្មីទៅក្នុងកម្មវិធីសិក្សា</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                }`}>
                  {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  <p>{message.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ឈ្មោះមុខវិជ្ជា <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <select
                      value={isCustom ? 'other' : formData.name}
                      onChange={handleSelectChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white"
                    >
                      <option value="" disabled>-- ជ្រើសរើសមុខវិជ្ជា --</option>
                      {PREDEFINED_SUBJECTS.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                      <option value="other">ផ្សេងៗ (កំណត់ដោយខ្លួនឯង)</option>
                    </select>

                    {isCustom && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="បញ្ចូលឈ្មោះមុខវិជ្ជា..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ការពិពណ៌នា
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="ពិពណ៌នាសង្ខេបអំពីមុខវិជ្ជានេះ..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-white hover:border-gray-400 transition-all"
                    disabled={loading}
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        កំពុងរក្សាទុក...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        បង្កើតមុខវិជ្ជា
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Preview Card */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <GraduationCap className="text-indigo-600" size={20} />
                   មើលគំរូ
                </h3>
                
                {/* Subject Card Preview */}
                <div className="group relative bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-300 overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-l-xl"></div>
                   <div className="flex items-start justify-between mb-3 pl-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                         <BookOpen size={24} />
                      </div>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                         សកម្ម
                      </span>
                   </div>
                   
                   <div className="pl-3">
                      <h4 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                         {formData.name || 'ឈ្មោះមុខវិជ្ជា'}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                         {formData.description || 'គ្មានការពិពណ៌នា...'}
                      </p>
                   </div>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>ចំណាំ៖</strong> មុខវិជ្ជាដែលបានបង្កើតនឹងបង្ហាញនៅក្នុងបញ្ជីសម្រាប់គ្រូដើម្បីជ្រើសរើសនៅពេលបង្កើតកាលវិភាគ។
                   </p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateSubjectPagePrincipal;