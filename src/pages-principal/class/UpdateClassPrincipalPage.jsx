import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, X, Calendar as CalendarIcon, Clock, Book, Plus, Trash2, AlertCircle 
} from 'lucide-react';
import { request } from "./../../util/request";

const UpdateClassPrincipalPage = () => {
  const params = useParams();
  const id = params.id || params.classId;
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
  const [teachers, setTeachers] = useState([]); // teachers with id (internal PK) and user_id
  const [schoolId, setSchoolId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Get current principal's school
        const principalRes = await request('/principals/me', 'GET');
        const currentSchoolId = principalRes.data?.school_id || principalRes.data?.data?.school_id;

        if (!currentSchoolId) {
          throw new Error("Could not determine your school. Please contact support.");
        }
        setSchoolId(currentSchoolId);

        // 2. Fetch class details
        const classRes = await request(`/classes/${id}`, 'GET');
        const classData = classRes.data?.data || classRes.data;

        if (!classData) {
          throw new Error("Class not found");
        }

        // Verify class belongs to principal's school
        if (classData.school_id !== currentSchoolId) {
          throw new Error("Access denied. This class does not belong to your school.");
        }

        setFormData({
          name: classData.name || '',
          academic_year: classData.academic_year || '',
          start_date: classData.start_date?.split('T')[0] || '',
          end_date: classData.end_date?.split('T')[0] || '',
          start_time: classData.start_time?.slice(0,5) || '',
          end_time: classData.end_time?.slice(0,5) || '',
        });

        // 3. Load subjects & teachers of this school
        const [subjectsRes, teachersRes] = await Promise.all([
          request(`/subjects/school/${currentSchoolId}`, 'GET'),
          request(`/teachers/school/${currentSchoolId}`, 'GET')
        ]);

        setSubjects(subjectsRes.data?.data || subjectsRes.data || []);
        setTeachers(teachersRes.data?.data || teachersRes.data || []);

        // 4. Try to load existing schedules
        try {
          const schedulesRes = await request(`/schedules?class_id=${id}`, 'GET');

          const loadedSchedules = (schedulesRes.data?.data || schedulesRes.data || []).map(s => {
            // Find the teacher in the teachers list to get their user_id
            const teacher = teachersRes.data?.data?.find(t => t.id === s.teacher_id) || 
                           teachersRes.data?.find(t => t.id === s.teacher_id);
            
            return {
              id: s.id,
              subject_id: s.subject_id?.toString() || '',
              teacher_id: s.teacher_id?.toString() || '', // Use user_id for backend
              day_of_week: s.day_of_week || 'Monday',
              start_time: s.start_time?.slice(0,5) || '',
              end_time: s.end_time?.slice(0,5) || '',
            };
          });

          setSchedules(loadedSchedules);
        } catch (schedError) {
          console.warn("Could not load schedules:", schedError);
          // It's okay if schedules don't exist yet
          setSchedules([]);
        }

      } catch (err) {
        console.error("Failed to load class data:", err);
        setError(
          err.response?.data?.message || 
          err.message ||
          "Failed to load class information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClassData();
    }
  }, [id]);

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
      teacher_id: '',           // ← will be teachers.user_id
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

    // Basic validation
    if (!formData.name.trim() || !formData.academic_year.trim()) {
      setError("Class name and academic year are required.");
      setSubmitting(false);
      return;
    }

    // Check class time range
    if (formData.start_time && formData.end_time && 
        !validateTimes(formData.start_time, formData.end_time)) {
      setError("Class end time must be after start time.");
      setSubmitting(false);
      return;
    }

    // Check all schedules
    for (const s of schedules) {
      if (!s.subject_id || !s.teacher_id || !s.start_time || !s.end_time) {
        setError("All schedule entries must have subject, teacher, start and end time.");
        setSubmitting(false);
        return;
      }
      if (!validateTimes(s.start_time, s.end_time)) {
        setError("In one or more schedules, end time is before or equal to start time.");
        setSubmitting(false);
        return;
      }
    }

    try {
      // Prepare the payload according to backend update function
      const payload = {
        name: formData.name.trim(),
        academic_year: formData.academic_year.trim(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        start_time: formData.start_time ? `${formData.start_time}:00` : null,
        end_time: formData.end_time ? `${formData.end_time}:00` : null,
        schedules: schedules.length > 0 ? schedules.map(s => ({
          subject_id: parseInt(s.subject_id, 10),
          teacher_id: parseInt(s.teacher_id, 10), // This should be USER_ID
          day_of_week: s.day_of_week,
          start_time: s.start_time.includes(':00') ? s.start_time : `${s.start_time}:00`,
          end_time: s.end_time.includes(':00') ? s.end_time : `${s.end_time}:00`,
        })) : []
      };

      console.log("Submitting payload:", payload);

      await request(`/classes/${id}`, 'PUT', payload);

      // Success!
      navigate('/principal/classes', { 
        state: { message: 'Class updated successfully!' } 
      });

    } catch (err) {
      console.error("Class update failed:", err);
      console.error("Error details:", err.response?.data);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to update class. Please check all fields and try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Class</h1>
        <p className="text-gray-600 mb-8">Update class information and weekly schedule</p>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Class Information ── */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Book className="text-blue-600" size={20} />
              Class Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Grade 7A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <input
                  type="text"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  placeholder="e.g. 2025-2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* ── Weekly Schedule ── */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Weekly Schedule
              </h2>
              <button
                type="button"
                onClick={addSchedule}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Plus size={18} /> Add Slot
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                No schedule entries yet. Click "Add Slot" to begin.
              </div>
            ) : (
              <div className="space-y-5">
                {schedules.map((schedule, index) => (
                  <div 
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-gray-50 border rounded-xl relative"
                  >
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select
                        name="subject_id"
                        value={schedule.subject_id}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select subject</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                      <select
                        name="teacher_id"
                        value={schedule.teacher_id}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select teacher</option>
                        {teachers.map(t => (
                          <option 
                            key={t.id} 
                            value={t.id}           // ← IMPORTANT: use t.id (user_id)
                          >
                            {t.first_name} {t.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                      <select
                        name="day_of_week"
                        value={schedule.day_of_week}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                      >
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
                          .map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                      <input
                        type="time"
                        name="start_time"
                        value={schedule.start_time}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">End *</label>
                      <input
                        type="time"
                        name="end_time"
                        value={schedule.end_time}
                        onChange={(e) => handleScheduleChange(index, e)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSchedule(index)}
                      className="absolute -top-3 -right-3 bg-white border border-red-300 text-red-600 p-2 rounded-full hover:bg-red-50 shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/principal/classes')}
              className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitting || loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2 shadow-md"
            >
              {submitting ? 'Updating...' : (
                <>
                  <Save size={18} /> Update Class
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateClassPrincipalPage;