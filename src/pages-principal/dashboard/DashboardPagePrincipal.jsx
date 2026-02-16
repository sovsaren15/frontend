import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  School,
  TrendingUp,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import { request } from "./../../util/request";
import { useNavigate } from "react-router-dom";

// Custom Simple Chart Components defined outside to prevent re-renders
const SimpleBarChart = ({ data, dataKey, labelKey, color }) => {
  const max = Math.max(...data.map((d) => d[dataKey])) || 1;
  return (
    <div className="flex items-end justify-between h-full gap-2 pt-8 pb-2 px-2">
      {data.map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-end h-full flex-1 group relative"
        >
          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-primary text-white text-xs rounded px-2 py-1 transition-opacity whitespace-nowrap z-10 pointer-events-none">
            {item[labelKey]}: {item[dataKey]}
          </div>
          <div
            className={`w-full max-w-[30px] sm:max-w-[40px] rounded-t-md transition-all duration-500 ${color} hover:opacity-80`}
            style={{ height: `${(item[dataKey] / max) * 100}%` }}
          ></div>
          <span className="text-[10px] sm:text-xs text-gray-500 mt-2 truncate w-full text-center">
            {item[labelKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

const SimpleAreaChart = ({ data, dataKey, labelKey, colorHex }) => {
  const max = 100;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d[dataKey] / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-full w-full relative pt-4 pb-6 px-2 flex flex-col justify-end">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={colorHex}
          fillOpacity="0.1"
        />
        <polyline
          points={points}
          fill="none"
          stroke={colorHex}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i}>{d[labelKey]}</span>
        ))}
      </div>
    </div>
  );
};

const SimplePieChart = ({ data }) => {
  // Check if data is available, otherwise show placeholder
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        កំពុងទាញយកទិន្នន័យ...
      </div>
    );
  }

  const passPercentage = data[0].value;
  const isNoData = data[0].value === 0 && data[1].value === 0;

  return (
    <div className="h-full flex items-center justify-center relative">
      <div
        className="relative w-40 h-40 rounded-full overflow-hidden"
        style={{
          background: isNoData
            ? "#E5E7EB" // Gray if no data
            : `conic-gradient(#10B981 0% ${passPercentage}%, #EF4444 ${passPercentage}% 100%)`,
        }}
      >
        <div className="absolute inset-0 m-auto w-28 h-28 bg-white rounded-full flex items-center justify-center flex-col">
          {isNoData ? (
            <span className="text-sm text-gray-400 font-medium">
              គ្មានទិន្នន័យ
            </span>
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-800">
                {passPercentage}%
              </span>
              <span className="text-sm text-gray-500 font-medium">ជាប់</span>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 flex flex-col gap-2 text-xs bg-white/90 p-3 rounded-xl border border-gray-100 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
          <span className="font-medium text-gray-600">ជាប់</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"></div>
          <span className="font-medium text-gray-600">ធ្លាក់</span>
        </div>
      </div>
    </div>
  );
};


const StackedBarChart = ({ data, labelKey }) => {
  const getMax = () => {
    let m = 0;
    data.forEach((d) => {
      const total = (d.present || 0) + (d.absent || 0) + (d.permission || 0) + (d.late || 0);
      m = Math.max(m, total);
    });
    return m || 1;
  };
  const maxVal = getMax();

  return (
    <div className="flex items-end justify-between h-full gap-2 pt-8 pb-2 px-2">
      {data.map((item, i) => {
        const total = (item.present || 0) + (item.absent || 0) + (item.permission || 0) + (item.late || 0);
        const heightPercent = maxVal > 0 ? (total / maxVal) * 100 : 0;
        
        return (
        <div
          key={i}
          className="flex flex-col items-center justify-end h-full flex-1 min-w-0 group"
        >
          <div className="relative w-full flex flex-col items-center justify-end" style={{ height: `${heightPercent}%` }}>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 bg-primary text-white text-xs rounded-lg p-2 transition-opacity z-50 pointer-events-none shadow-lg min-w-[140px] left-1/2 -translate-x-1/2">
                <div className="font-bold mb-1 text-center border-b border-gray-700 pb-1 whitespace-nowrap">{item[labelKey]}</div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>វត្តមាន: {item.present}</div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>ច្បាប់: {item.permission}</div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>មកយឺត: {item.late}</div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>អវត្តមាន: {item.absent}</div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>

            <div 
              className="w-full max-w-[30px] sm:max-w-[40px] rounded-t-md overflow-hidden flex flex-col-reverse bg-gray-50 transition-all duration-500 h-full" 
            >
              {total > 0 && (
                <>
                  <div style={{ height: `${(item.present / total) * 100}%` }} className="w-full bg-indigo-500 hover:bg-indigo-600 transition-colors"></div>
                  <div style={{ height: `${(item.permission / total) * 100}%` }} className="w-full bg-green-500 hover:bg-green-600 transition-colors"></div>
                  <div style={{ height: `${(item.late / total) * 100}%` }} className="w-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
                  <div style={{ height: `${(item.absent / total) * 100}%` }} className="w-full bg-red-500 hover:bg-red-600 transition-colors"></div>
                </>
              )}
            </div>
          </div>
          <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">
            {item[labelKey]}
          </span>
        </div>
      )})}
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
        <TrendingUp className="w-3 h-3" />
        <span>Live</span>
      </div>
    </div>

    <div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-semibold text-gray-900">{value || 0}</p>
    </div>
  </div>
);

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  let displayImage = null;

  if (event.image) {
    try {
      const parsed =
        typeof event.image === "string" ? JSON.parse(event.image) : event.image;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayImage = parsed[0];
      } else if (typeof parsed === "string") {
        displayImage = parsed;
      }
    } catch (e) {
      if (typeof event.image === "string") displayImage = event.image;
    }
  }

  const imageUrl = displayImage
    ? displayImage.startsWith("http")
      ? displayImage
      : `http://localhost:8081/${displayImage}`
    : null;

  return (
    <div 
      onClick={() => navigate(`/principal/events/viewdetail/${event.id}`)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100"
          />
        ) : (
          <div className="bg-blue-50 p-3 rounded-lg shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {event.title}
          </h4>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(event.date || event.start_date).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            )}
          </p>
          <p className="text-xs text-indigo-600 mt-1 font-medium">
            មើលលម្អិតព្រឹត្តិការណ៍
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
      </div>
    </div>
  );
};

const khmerMonths = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const DashboardPagePrincipal = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  // Raw Data States
  const [studentList, setStudentList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);

  // Chart Data States
  const [newStudentData, setNewStudentData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([
    { name: "ច័ន្ទ", present: 0, absent: 0, permission: 0, late: 0 },
    { name: "អង្គារ", present: 0, absent: 0, permission: 0, late: 0 },
    { name: "ពុធ", present: 0, absent: 0, permission: 0, late: 0 },
    { name: "ព្រហស្បតិ៍", present: 0, absent: 0, permission: 0, late: 0 },
    { name: "សុក្រ", present: 0, absent: 0, permission: 0, late: 0 },
  ]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    permission: 0,
    late: 0,
  });
  const [attendanceTitle, setAttendanceTitle] = useState(
    "វត្តមានសិស្សប្រចាំសប្តាហ៍",
  );
  const [attendanceAverage, setAttendanceAverage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Independent Filter States
  const [newStudentYear, setNewStudentYear] = useState(
    new Date().getFullYear(),
  );
  const [attendanceFilters, setAttendanceFilters] = useState({
    year: new Date().getFullYear(),
    periodType: "monthly",
    period: String(new Date().getMonth() + 1).padStart(2, "0"),
  });
  const [performanceFilters, setPerformanceFilters] = useState({
    year: new Date().getFullYear(),
    periodType: "semester",
    period: "Semester 1",
  });

  const navigate = useNavigate();

  // 1. Fetch Initial Data (Dashboard, Students, Attendance)
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Main Dashboard Data
      const response = await request("/principals/dashboard", "GET");
      let data = response.data;

      // Fetch Raw Lists
      if (data?.school?.id) {
        const schoolId = data.school.id;
        const [resStudents, resAttendance, resEvents] = await Promise.all([
          request(`/students?school_id=${schoolId}&limit=10000`, "GET"),
          request(`/attendance?school_id=${schoolId}&limit=10000`, "GET"),
          request(`/events?school_id=${schoolId}&limit=10000`, "GET"),
        ]);
        setStudentList(resStudents.data?.data || resStudents.data || []);
        setAttendanceList(resAttendance.data?.data || resAttendance.data || []);

        const events = resEvents.data?.data || resEvents.data || [];
        data = {
          ...data,
          recent_events: events,
        };
      }
      setDashboardData(data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
      setError(err.message || "An unexpected error occurred.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Performance Data (Dependent on Filters)
  const fetchPerformanceData = async () => {
    if (!dashboardData?.school?.id) return;

    try {
      const schoolId = dashboardData.school.id;
      const MAX_SCORE = 10;

      const normalizeAssessmentType = (type, subjectName) => {
        if (
          subjectName.toLowerCase().includes("khmer") ||
          subjectName.includes("ភាសាខ្មែរ")
        ) {
          const typeMap = {
            សមត្ថភាពស្តាប់: "សមត្ថភាពស្តាប់",
            សមត្ថភាពនិយាយ: "សមត្ថភាពនិយាយ",
            សមត្ថភាពអាន: "សមត្ថភាពអាន",
            សមត្ថភាពសរសេរ: "សមត្ថភាពសរសេរ",
          };
          return typeMap[type] || type;
        }
        return type;
      };

      const calculateStudentAverage = (studentScores) => {
        if (!studentScores || studentScores.length === 0) return 0;
        
        const typeGroups = {};
        studentScores.forEach((s) => {
          const sName = s.subject_name || "Unknown";
          const subId = s.subject_id || sName;
          const key = `${subId}-${s.assessment_type}`;
          if (!typeGroups[key]) typeGroups[key] = [];
          typeGroups[key].push(Number(s.score));
        });

        const typeAverages = Object.values(typeGroups).map(
          (scores) => scores.reduce((a, b) => a + b, 0) / scores.length,
        );

        if (typeAverages.length === 0) return 0;
        return typeAverages.reduce((a, b) => a + b, 0) / typeAverages.length;
      };

      const results = {};

      if (performanceFilters.periodType === "yearly") {
        const year = performanceFilters.year;
        const [resS1, resS2] = await Promise.all([
          request(`/scores?school_id=${schoolId}&year=${year}&academic_period=Semester 1&period_type=semester`, "GET"),
          request(`/scores?school_id=${schoolId}&year=${year}&academic_period=Semester 2&period_type=semester`, "GET")
        ]);

        const rawS1 = resS1.data?.data || resS1.data || [];
        const rawS2 = resS2.data?.data || resS2.data || [];

        const normS1 = rawS1.map(s => ({...s, assessment_type: normalizeAssessmentType(String(s.assessment_type || "").trim(), s.subject_name || "")}));
        const normS2 = rawS2.map(s => ({...s, assessment_type: normalizeAssessmentType(String(s.assessment_type || "").trim(), s.subject_name || "")}));

        studentList.forEach(student => {
          const sId = student.student_id || student.id;
          const s1 = normS1.filter(s => (s.student_id || s.studentId) == sId);
          const s2 = normS2.filter(s => (s.student_id || s.studentId) == sId);

          if (s1.length === 0 && s2.length === 0) return;

          const avgS1 = calculateStudentAverage(s1);
          const avgS2 = calculateStudentAverage(s2);

          let finalScore = 0;
          if (s1.length > 0 && s2.length > 0) {
            finalScore = (avgS1 + avgS2) / 2;
          } else if (s1.length > 0) {
            finalScore = avgS1;
          } else {
            finalScore = avgS2;
          }

          results[sId] = finalScore >= MAX_SCORE / 2 ? "ជាប់" : "ធ្លាក់";
        });
      } else {
        let scoresUrl = `/scores?school_id=${schoolId}`;
        if (performanceFilters.periodType === "semester") {
          scoresUrl += `&year=${performanceFilters.year}&academic_period=${performanceFilters.period}&period_type=semester`;
        } else {
          const lastDay = new Date(performanceFilters.year, parseInt(performanceFilters.period), 0).getDate();
          scoresUrl += `&date_from=${performanceFilters.year}-${performanceFilters.period}-01&date_to=${performanceFilters.year}-${performanceFilters.period}-${lastDay}`;
        }

        const resScores = await request(scoresUrl, "GET");
        const rawScores = resScores.data?.data || resScores.data || [];
        const scores = rawScores.map((s) => ({
          ...s,
          assessment_type: normalizeAssessmentType(String(s.assessment_type || "").trim(), s.subject_name || ""),
        }));

        studentList.forEach((student) => {
          const sId = student.student_id || student.id;
          const studentScores = scores.filter((s) => (s.student_id || s.studentId) == sId);
          if (studentScores.length === 0) return;
          
          const finalScore = calculateStudentAverage(studentScores);
          results[sId] = finalScore >= MAX_SCORE / 2 ? "ជាប់" : "ធ្លាក់";
        });
      }

      const passed = Object.values(results).filter(
        (status) => status === "ជាប់",
      ).length;
      const failed = Object.values(results).filter(
        (status) => status === "ធ្លាក់",
      ).length;
      const total = passed + failed;

      if (total > 0) {
        const passPercent = Math.round((passed / total) * 100);
        setPerformanceData([
          { name: "ជាប់", value: passPercent },
          { name: "ធ្លាក់", value: 100 - passPercent },
        ]);
      } else {
        // Default if no scores exist yet
        setPerformanceData([
          { name: "ជាប់", value: 0 },
          { name: "ធ្លាក់", value: 0 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setPerformanceData([
        { name: "ជាប់", value: 0 },
        { name: "ធ្លាក់", value: 0 },
      ]);
    }
  };

  // 3. Calculate New Students Data (Client-side)
  useEffect(() => {
    if (!studentList.length) return;

    const monthlyStats = khmerMonths.map((name) => ({ name, students: 0 }));

    studentList.forEach((student) => {
      if (student.enrollment_date) {
        const dateStr = String(student.enrollment_date);
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(5, 7)) - 1;

        if (year === Number(newStudentYear) && !isNaN(month)) {
          monthlyStats[month].students++;
        }
      }
    });
    setNewStudentData(monthlyStats);
  }, [studentList, newStudentYear]);

  // 4. Calculate Attendance Data (Client-side)
  useEffect(() => {
    if (!attendanceList.length && !loading) {
      // If loaded but empty, still run to clear charts
    }

    let weekData = [];
    let periodRecords = [];

    if (attendanceFilters.periodType === "monthly") {
      const year = parseInt(attendanceFilters.year);
      const monthIndex = parseInt(attendanceFilters.period) - 1;
      setAttendanceTitle(`វត្តមានសិស្សខែ ${khmerMonths[monthIndex]}`);

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      weekData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayRecords = attendanceList.filter((a) => {
          if (!a.date) return false;
          return String(a.date).startsWith(dateStr);
        });
        periodRecords.push(...dayRecords);

        const dayStats = { present: 0, absent: 0, permission: 0, late: 0 };
        dayRecords.forEach((r) => {
          const s = (r.status || "present").toLowerCase();
          if (dayStats[s] !== undefined) dayStats[s]++;
        });

        return { name: `${day}`, ...dayStats };
      });
    } else {
      setAttendanceTitle("វត្តមានសិស្សប្រចាំសប្តាហ៍");
      const now = new Date();
      const currentDay = now.getDay(); // 0-6
      const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const monday = new Date(now);
      monday.setDate(diff);
      monday.setHours(0, 0, 0, 0);

      weekData = ["ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ"].map(
        (name, index) => {
          const date = new Date(monday);
          date.setDate(monday.getDate() + index);

          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const dateStr = `${yyyy}-${mm}-${dd}`;

          const dayRecords = attendanceList.filter((a) => {
            if (!a.date) return false;
            return String(a.date).startsWith(dateStr);
          });
          periodRecords.push(...dayRecords);

          const dayStats = { present: 0, absent: 0, permission: 0, late: 0 };
          dayRecords.forEach((r) => {
            const s = (r.status || "present").toLowerCase();
            if (dayStats[s] !== undefined) dayStats[s]++;
          });

          return {
            name,
            present: Math.round((presentCount / dayRecords.length) * 100),
            ...dayStats,
          };
        },
      );
    }

    const stats = { present: 0, absent: 0, permission: 0, late: 0 };
    periodRecords.forEach((r) => {
      const status = (r.status || "present").toLowerCase();
      if (stats[status] !== undefined) stats[status]++;
    });
    setAttendanceStats(stats);

    const avg = Math.round(
      weekData.reduce((acc, curr) => acc + curr.present, 0) /
        (weekData.filter((d) => d.present > 0).length || 1),
    );
    setAttendanceAverage(avg);
    setAttendanceData(weekData);
  }, [attendanceList, attendanceFilters]);

  // 5. Effects for Data Loading
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [performanceFilters, dashboardData?.school?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">
            កំពុងដំណើរការ...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="bg-red-50 p-4 rounded-full inline-block mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ
          </h3>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <button
            onClick={fetchInitialData}
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData?.school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
            <School className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            មិនមានសាលារៀន
          </h3>
          <p className="text-gray-600 text-sm">
            សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធរបស់អ្នក។
          </p>
        </div>
      </div>
    );
  }

  const { school, stats, recent_events } = dashboardData;

  return (
    <div className="min-h-screen font-kantumruy">
      {/* Main Content */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            icon={Users}
            title="គ្រូបង្រៀនសរុប"
            value={stats.total_teachers}
            color="bg-blue-600"
          />
          <StatCard
            icon={GraduationCap}
            title="សិស្សសរុប"
            value={stats.total_students}
            color="bg-emerald-600"
          />
          <StatCard
            icon={BookOpen}
            title="ថ្នាក់រៀនសរុប"
            value={stats.total_classes}
            color="bg-purple-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1  gap-6 mb-8">
          {/* Attendance Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {attendanceTitle}
                </h3>
                <div className="flex gap-1">
                  <select
                    value={attendanceFilters.periodType}
                    onChange={(e) =>
                      setAttendanceFilters((prev) => ({
                        ...prev,
                        periodType: e.target.value,
                      }))
                    }
                    className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none"
                  >
                    <option value="monthly">ប្រចាំខែ</option>
                    <option value="weekly">ប្រចាំសប្តាហ៍</option>
                  </select>
                  {attendanceFilters.periodType === "monthly" && (
                    <select
                      value={attendanceFilters.period}
                      onChange={(e) =>
                        setAttendanceFilters((prev) => ({
                          ...prev,
                          period: e.target.value,
                        }))
                      }
                      className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none"
                    >
                      {khmerMonths.map((m, i) => (
                        <option key={i} value={String(i + 1).padStart(2, "0")}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={attendanceFilters.year}
                    onChange={(e) =>
                      setAttendanceFilters((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }))
                    }
                    className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none"
                  >
                    {Array.from(
                      { length: 3 },
                      (_, i) => new Date().getFullYear() - i,
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                មធ្យម {attendanceAverage}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <CheckCircle size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">វត្តមាន</p>
                  <p className="text-lg font-bold text-indigo-700">
                    {attendanceStats.present}
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <XCircle size={18} className="text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">អវត្តមាន</p>
                  <p className="text-lg font-bold text-red-700">
                    {attendanceStats.absent}
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <FileText size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">ច្បាប់</p>
                  <p className="text-lg font-bold text-green-700">
                    {attendanceStats.permission}
                  </p>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Clock size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">មកយឺត</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {attendanceStats.late}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-64">
              <StackedBarChart data={attendanceData} labelKey="name" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Academic Performance */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">លទ្ធផលសិក្សា</h3>
              <div className="flex gap-1 items-center">
                  <select
                    value={performanceFilters.periodType}
                    onChange={(e) =>
                      setPerformanceFilters((prev) => ({
                        ...prev,
                        periodType: e.target.value,
                        period:
                          e.target.value === "semester" ? "Semester 1" : 
                          e.target.value === "yearly" ? "Yearly" : "01",
                      }))
                    }
                    className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none"
                  >
                    <option value="semester">ឆមាស</option>
                    <option value="monthly">ប្រចាំខែ</option>
                    <option value="yearly">ប្រចាំឆ្នាំ</option>
                  </select>
                  <select
                    value={performanceFilters.year}
                    onChange={(e) =>
                      setPerformanceFilters((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }))
                    }
                    className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none"
                  >
                    {Array.from(
                      { length: 3 },
                      (_, i) => new Date().getFullYear() - i,
                    ).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                <select
                  value={performanceFilters.period}
                  onChange={(e) =>
                    setPerformanceFilters((prev) => ({
                      ...prev,
                      period: e.target.value,
                    }))
                  }
                  disabled={performanceFilters.periodType === "yearly"}
                  className={`text-[10px] bg-gray-50 border border-gray-200 rounded px-1 py-0.5 outline-none ${performanceFilters.periodType === "yearly" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {performanceFilters.periodType === "semester" ? (
                    <>
                      <option value="Semester 1">ឆមាសទី ១</option>
                      <option value="Semester 2">ឆមាសទី ២</option>
                    </>
                  ) : performanceFilters.periodType === "yearly" ? (
                    <option value="Yearly">ពេញមួយឆ្នាំ</option>
                  ) : (
                    khmerMonths.map((m, i) => (
                      <option key={i} value={String(i + 1).padStart(2, "0")}>
                        {m}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            <div className="flex-1 min-h-[250px]">
              <SimplePieChart data={performanceData} />
            </div>
          </div>
          {/* New Students Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                សិស្សថ្មីប្រចាំខែ
              </h3>
              <select
                value={newStudentYear}
                onChange={(e) => setNewStudentYear(e.target.value)}
                className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border-none outline-none cursor-pointer"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-64">
              <SimpleBarChart
                data={newStudentData}
                dataKey="students"
                labelKey="name"
                color="bg-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Events */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  ព្រឹត្តិការណ៍ថ្មីៗ
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  សកម្មភាពដែលនឹងមកដល់ឆាប់ៗនេះ
                </p>
              </div>
              <button
                onClick={() => navigate("/principal/events")}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold hover:underline"
              >
                មើលទាំងអស់
              </button>
            </div>

            {recent_events && recent_events.length > 0 ? (
              <div className="space-y-3">
                {recent_events.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <div className="bg-white p-3 rounded-full inline-block mb-3 shadow-sm">
                  
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium">
                  មិនមានព្រឹត្តិការណ៍ទេ
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  សូមត្រឡប់មកពិនិត្យម្តងទៀតនៅពេលក្រោយ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPagePrincipal;
