import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { request } from "../../util/request";
import { Calendar, Save, Loader2, Search, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

// Reusable Stat Card Component
const StatCard = ({ label, count, colorClass, icon: Icon }) => (
  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between min-w-[140px]">
    <div>
      <span className={`text-2xl font-bold ${colorClass}`}>{count}</span>
      <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
    </div>
    {Icon && <div className={`p-2 rounded-full bg-gray-50 ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
      <Icon size={20} className={colorClass} />
    </div>}
  </div>
);

const AttendanceTeacherPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Initialize date to today YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, permission: 0, late: 0 });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Initial Load of Classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await request('/classes/teacher/me', 'GET');
      const classList = res.data || res || [];
      setClasses(classList);
      
      if (location.state?.classId) {
        const targetId = parseInt(location.state.classId);
        const targetClass = classList.find(c => c.id === targetId);
        if (targetClass) {
          setSelectedClass(targetClass.id);
          return;
        }
      }

      if (classList.length > 0 && !selectedClass) setSelectedClass(classList[0].id);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យថ្នាក់");
    }
  };

  // 2. Helper to Calculate Stats
  const calculateStats = (data) => {
    const initial = { present: 0, absent: 0, permission: 0, late: 0 };
    const counts = Object.values(data).reduce((acc, curr) => {
      const status = curr.status || 'present';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, initial);
    
    setStats({ ...counts, total: Object.keys(data).length });
  };

  // 3. Fetch Data Logic (FIXED DATE MATCHING HERE)
  const fetchAttendanceData = useCallback(async () => {
    if (!selectedClass || !date) return;

    setLoading(true);
    try {
      // Fetch students and attendance in parallel
      const [studentsRes, attendanceRes] = await Promise.all([
        request(`/students?class_id=${selectedClass}`, 'GET'),
        request(`/attendance?class_id=${selectedClass}&date=${date}`, 'GET')
      ]);
      
      // Normalize student list response
      let studentList = [];
      if (studentsRes.data && Array.isArray(studentsRes.data)) {
        studentList = studentsRes.data;
      } else if (studentsRes.data && studentsRes.data.data && Array.isArray(studentsRes.data.data)) {
        studentList = studentsRes.data.data;
      } else if (Array.isArray(studentsRes)) {
        studentList = studentsRes;
      }

      // Normalize attendance response
      const existingRecords = Array.isArray(attendanceRes) ? attendanceRes : (attendanceRes.data || []);

      setStudents(studentList);
      
      const initialAttendance = {};
      
      studentList.forEach(s => {
        const sId = String(s.student_id || s.id);
        
        // --- CRITICAL FIX: Match both Student ID AND Date ---
        const record = existingRecords.find(r => {
          const idMatch = String(r.student_id) === sId;
          // Split by 'T' to handle ISO strings like "2026-01-23T00:00:00" if backend sends them
          const recordDate = r.date ? String(r.date).split('T')[0] : '';
          const dateMatch = recordDate === date;
          return idMatch && dateMatch;
        });

        initialAttendance[sId] = {
          status: record ? record.status : 'present', // Default to present if no record found for this date
          remarks: record ? (record.remarks || '') : ''
        };
      });

      setAttendanceData(initialAttendance);
      calculateStats(initialAttendance);

    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យ");
    } finally {
      setLoading(false);
    }
  }, [selectedClass, date]);

  // Trigger fetch when class or date changes
  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // 4. Handle User Interaction
  const handleStatusChange = (studentId, newStatus) => {
    const sId = String(studentId);
    const updated = {
      ...attendanceData,
      [sId]: { ...attendanceData[sId], status: newStatus }
    };
    setAttendanceData(updated);
    calculateStats(updated);
  };

  const handleRemarksChange = (studentId, value) => {
    const sId = String(studentId);
    const updated = {
      ...attendanceData,
      [sId]: { ...attendanceData[sId], remarks: value }
    };
    setAttendanceData(updated);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const records = Object.keys(attendanceData).map(key => ({
        student_id: parseInt(key),
        status: attendanceData[key].status,
        remarks: attendanceData[key].remarks
      }));

      await request('/attendance', 'POST', {
        class_id: selectedClass,
        date,
        records
      });
      
      toast.success("រក្សាទុកជោគជ័យ");
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការរក្សាទុក");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      (s.last_name + " " + s.first_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.student_code && s.student_code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6 font-kantumruy">
      
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ការគ្រប់គ្រងវត្តមានសិស្ស</h1>
            <p className="text-gray-500 mt-1 text-sm">ស្រង់វត្តមានប្រចាំថ្ងៃសម្រាប់ថ្នាក់រៀន</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 font-medium cursor-pointer"
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>រក្សាទុក</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="សិស្សសរុប" count={stats.total} colorClass="text-gray-700" icon={null} />
        <StatCard label="វត្តមាន" count={stats.present} colorClass="text-indigo-600" icon={CheckCircle} />
        <StatCard label="អវត្តមាន" count={stats.absent} colorClass="text-red-600" icon={XCircle} />
        <StatCard label="ច្បាប់" count={stats.permission} colorClass="text-green-600" icon={FileText} />
        <StatCard label="មកយឺត" count={stats.late} colorClass="text-yellow-600" icon={Clock} />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="font-bold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
            បញ្ជីឈ្មោះសិស្ស ({filteredStudents.length})
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ស្វែងរកឈ្មោះ ឬ អត្ថលេខ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="text-sm">កំពុងទាញយកទិន្នន័យ...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold w-24">អត្ថលេខ</th>
                  <th className="py-4 px-6 font-semibold">ឈ្មោះសិស្ស</th>
                  <th className="py-4 px-6 font-semibold">ភេទ</th>
                  <th className="py-4 px-6 font-semibold">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th className="py-4 px-4 text-center font-semibold w-24 text-indigo-600">វត្តមាន</th>
                  <th className="py-4 px-4 text-center font-semibold w-24 text-red-600">អវត្តមាន</th>
                  <th className="py-4 px-4 text-center font-semibold w-24 text-green-600">ច្បាប់</th>
                  <th className="py-4 px-4 text-center font-semibold w-24 text-yellow-600">មកយឺត</th>
                  <th className="py-4 px-6 text-center font-semibold w-48">សម្គាល់</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => {
                  const sId = String(student.student_id || student.id);
                  const status = attendanceData[sId]?.status || 'present';
                  const remarks = attendanceData[sId]?.remarks || '';
                  
                  return (
                    <tr key={sId} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-4 px-6 text-gray-500 text-sm font-mono">
                        {student.student_code || student.student_id}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-800">{student.last_name} {student.first_name}</div>
                      </td>

                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {student.gender === 'Female' || student.sex === 'Female' ? 'ស្រី' : 'ប្រុស'}
                      </td>

                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {student.date_of_birth 
                          ? new Date(student.date_of_birth).toLocaleDateString('en-GB')
                          : <span className="text-gray-400 italic">មិនមាន</span>
                        }
                      </td>

                      {['present', 'absent', 'permission', 'late'].map((type) => (
                        <td key={type} className="py-4 px-4 text-center">
                          <label className="cursor-pointer flex justify-center items-center h-full w-full p-2 rounded-lg hover:bg-gray-100 transition-all">
                            <input
                              type="radio"
                              name={`status-${sId}`}
                              checked={status === type}
                              onChange={() => handleStatusChange(sId, type)}
                              className={`w-5 h-5 cursor-pointer appearance-none border-2 rounded-full transition-all 
                                ${status === type 
                                  ? type === 'present' ? 'border-indigo-600 bg-indigo-600'
                                  : type === 'absent' ? 'border-red-600 bg-red-600'
                                  : type === 'permission' ? 'border-green-600 bg-green-600'
                                  : 'border-yellow-500 bg-yellow-500'
                                  : 'border-gray-300 hover:border-gray-400 bg-white'
                                }
                                relative checked:after:content-[''] checked:after:absolute checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 shadow-sm`
                              }
                            />
                          </label>
                        </td>
                      ))}

                      <td className="py-4 px-6 text-center">
                        {(status === 'permission' || status === 'late') ? (
                          <input
                            type="text"
                            value={remarks}
                            onChange={(e) => handleRemarksChange(sId, e.target.value)}
                            placeholder={status === 'permission' ? "មូលហេតុ..." : "ម៉ោង..."}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                          />
                        ) : (
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold w-24
                            ${status === 'present' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : ''}
                            ${status === 'absent' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
                          `}>
                            {status === 'present' && "វត្តមាន"}
                            {status === 'absent' && "អវត្តមាន"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/teacher/attendance-report')}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-sm"
        >
          មើលរបាយការណ៍
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all shadow-sm"
        >
          បោះបង់
        </button>
      </div>
      
    </div>
  );
};

export default AttendanceTeacherPage;