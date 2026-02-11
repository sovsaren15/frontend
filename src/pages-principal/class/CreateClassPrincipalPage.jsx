import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, Calendar as CalendarIcon, Clock, Book, Plus, Trash2, AlertCircle, ArrowLeft, GraduationCap, ChevronDown
} from 'lucide-react';
import { request } from "./../../util/request";

const CreateClassPrincipalPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    academic_year: '',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
  });

  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]); 
  const [schoolId, setSchoolId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Khmer Days Mapping for Display
  const daysOfWeek = [
    { value: 'Monday', label: 'ច័ន្ទ' },
    { value: 'Tuesday', label: 'អង្គារ' },
    { value: 'Wednesday', label: 'ពុធ' },
    { value: 'Thursday', label: 'ព្រហស្បតិ៍' },
    { value: 'Friday', label: 'សុក្រ' },
    { value: 'Saturday', label: 'សៅរ៍' },
    { value: 'Sunday', label: 'អាទិត្យ' }
  ];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const principalRes = await request('/principals/me', 'GET');
        const currentSchoolId = principalRes.data?.school_id || principalRes.data?.data?.school_id;

        if (!currentSchoolId) {
          throw new Error("មិនអាចកំណត់សាលារបស់អ្នកបានទេ។ សូមទាក់ទងជំនួយ។");
        }
        
        setSchoolId(currentSchoolId);

        const [subjectsRes, teachersRes] = await Promise.all([
          request(`/subjects/school/${currentSchoolId}`, 'GET'), 
          request(`/teachers/school/${currentSchoolId}`, 'GET')
        ]);

        setSubjects(subjectsRes.data?.data || subjectsRes.data || []);
        setTeachers(teachersRes.data?.data || teachersRes.data || []);

      } catch (err) {
        console.error("Initial data load failed:", err);
        setError(
          err.response?.data?.error?.message || 
          err.response?.data?.message || 
          err.message || 
          "បរាជ័យក្នុងការទាញយកទិន្នន័យ។ សូមពិនិត្យមើលការតភ្ជាប់របស់អ្នក ហើយព្យាយាមម្តងទៀត។"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, e) => {
    const { name, value } = e.target;
    setSchedules(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [name]: value };
      return updated;
    });
  };

  const addSchedule = () => {
    setSchedules(prev => [...prev, {
      subject_id: '',
      teacher_id: '', 
      day_of_week: 'Monday',
      start_time: '',
      end_time: ''
    }]);
  };

  const removeSchedule = (index) => {
    setSchedules(prev => prev.filter((_, i) => i !== index));
  };

  const validateTimes = (start, end) => {
    if (!start || !end) return true;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return endMin > startMin;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!schoolId) {
      setError("បាត់ព័ត៌មានសាលារៀន។ សូមព្យាយាមផ្ទុកទំព័រឡើងវិញ។");
      setSubmitting(false);
      return;
    }

    if (!formData.name.trim() || !formData.academic_year.trim()) {
      setError("ឈ្មោះថ្នាក់ និងឆ្នាំសិក្សា ត្រូវបានទាមទារ។");
      setSubmitting(false);
      return;
    }

    if (formData.start_time && formData.end_time && 
        !validateTimes(formData.start_time, formData.end_time)) {
      setError("ម៉ោងបញ្ចប់ថ្នាក់ត្រូវតែនៅក្រោយម៉ោងចាប់ផ្តើម។");
      setSubmitting(false);
      return;
    }

    for (const s of schedules) {
      if (!s.subject_id || !s.teacher_id || !s.start_time || !s.end_time) {
        setError("រាល់ការបញ្ចូលកាលវិភាគត្រូវតែមានមុខវិជ្ជា, គ្រូ, ម៉ោងចាប់ផ្តើម និងម៉ោងបញ្ចប់។");
        setSubmitting(false);
        return;
      }
      if (!validateTimes(s.start_time, s.end_time)) {
        setError("នៅក្នុងកាលវិភាគមួយ ឬច្រើន ម៉ោងបញ្ចប់គឺមុន ឬស្មើនឹងម៉ោងចាប់ផ្តើម។");
        setSubmitting(false);
        return;
      }
    }

    try {
      const classPayload = {
        school_id: schoolId,
        name: formData.name.trim(),
        academic_year: formData.academic_year.trim(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        start_time: formData.start_time ? `${formData.start_time}:00` : null,
        end_time: formData.end_time ? `${formData.end_time}:00` : null,
      };

      const classResponse = await request('/classes', 'POST', classPayload);
      
      const newClassId = classResponse.data?.id || 
                         classResponse.data?.data?.id || 
                         classResponse.data?.class_id;

      if (!newClassId) {
        throw new Error("បរាជ័យក្នុងការទទួលបានលេខសម្គាល់ថ្នាក់ថ្មីពីម៉ាស៊ីនមេ");
      }

      if (schedules.length > 0) {
        const schedulePromises = schedules.map(async (s) => {
          const schedulePayload = {
            class_id: newClassId,
            teacher_id: parseInt(s.teacher_id, 10),
            subject_id: parseInt(s.subject_id, 10),
            day_of_week: s.day_of_week,
            start_time: s.start_time.includes(':00') ? s.start_time : `${s.start_time}:00`,
            end_time: s.end_time.includes(':00') ? s.end_time : `${s.end_time}:00`,
          };

          return request('/schedules', 'POST', schedulePayload);
        });

        await Promise.all(schedulePromises);
      }

      navigate('/principal/classes', { 
        state: { message: 'ថ្នាក់ត្រូវបានបង្កើតដោយជោគជ័យ!' } 
      });

    } catch (err) {
      console.error("Class creation failed:", err);
      const errorMessage = err.response?.data?.error?.message || 
                           err.response?.data?.message || 
                           err.message || 
                           "បរាជ័យក្នុងការបង្កើតថ្នាក់។ សូមពិនិត្យមើលគ្រប់ចន្លោះ ហើយព្យាយាមម្តងទៀត។";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/50 min-h-screen font-kantumruy">
      <div className=" mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
                <GraduationCap size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  បង្កើតថ្នាក់ថ្មី
                </h1>
                <p className="text-gray-500 mt-1">រៀបចំថ្នាក់ថ្មី និងកំណត់កាលវិភាគប្រចាំសប្តាហ៍</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center gap-3 rounded-r-xl shadow-sm">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Class Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
              <Book className="text-indigo-600" size={24} />
              ព័ត៌មានថ្នាក់
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ឈ្មោះថ្នាក់ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ឧទាហរណ៍៖ ថ្នាក់ទី ៧ក"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ឆ្នាំសិក្សា <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none bg-white"
                    required
                  >
                    <option value="">ជ្រើសរើសឆ្នាំសិក្សា</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 1 + i;
                      return <option key={year} value={`${year}-${year + 1}`}>{year}-{year + 1}</option>;
                    })}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">កាលបរិច្ឆេទចាប់ផ្តើម</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">កាលបរិច្ឆេទបញ្ចប់</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ម៉ោងចូលរៀន</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ម៉ោងចេញ</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-indigo-600" size={24} />
                កាលវិភាគប្រចាំសប្តាហ៍
              </h2>
              <button
                type="button"
                onClick={addSchedule}
                className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-100 transition font-medium border border-indigo-100"
              >
                <Plus size={18} /> បន្ថែមម៉ោង
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="p-4 bg-white rounded-full inline-flex mb-3 shadow-sm">
                   <CalendarIcon className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-500 font-medium">មិនទាន់មានកាលវិភាគនៅឡើយទេ។</p>
                <p className="text-gray-400 text-sm mt-1">ចុច "បន្ថែមម៉ោង" ដើម្បីចាប់ផ្តើមរៀបចំ។</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule, index) => (
                  <div 
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 bg-gray-50 border border-gray-200 rounded-2xl relative group hover:border-indigo-200 hover:shadow-sm transition-all"
                  >
                    <div className="lg:col-span-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">មុខវិជ្ជា *</label>
                      <select
                        name="subject_id"
                        value={schedule.subject_id}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        required
                      >
                        <option value="">ជ្រើសរើសមុខវិជ្ជា</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">គ្រូបង្រៀន *</label>
                      <select
                        name="teacher_id"
                        value={schedule.teacher_id}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        required
                      >
                        <option value="">ជ្រើសរើសគ្រូ</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.first_name} {t.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ថ្ងៃ</label>
                      <select
                        name="day_of_week"
                        value={schedule.day_of_week}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        {daysOfWeek.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">ចាប់ផ្តើម *</label>
                      <input
                        type="time"
                        name="start_time"
                        value={schedule.start_time}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        required
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">បញ្ចប់ *</label>
                      <input
                        type="time"
                        name="end_time"
                        value={schedule.end_time}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="absolute -top-3 -right-3 bg-white border border-gray-200 text-gray-400 p-1.5 rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 pb-12">
            <button
              type="button"
              onClick={() => navigate('/principal/classes')}
              className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-white hover:border-gray-400 hover:shadow-sm transition-all disabled:opacity-50"
              disabled={submitting}
            >
              បោះបង់
            </button>
            
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? 'កំពុងបង្កើត...' : (
                <>
                  <Save size={20} /> បង្កើតថ្នាក់
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassPrincipalPage;