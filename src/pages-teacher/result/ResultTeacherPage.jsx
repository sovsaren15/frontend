import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Loader2,
  FileText,
  Calculator,
  Save,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { request } from "../../util/request";
import toast from 'react-hot-toast';

const calculateGradeFromScore = (val) => {
  const finalScore = Number(val);
  let letterGrade = 'F';
  if (finalScore >= 9) letterGrade = 'A';
  else if (finalScore >= 8) letterGrade = 'B';
  else if (finalScore >= 7) letterGrade = 'C';
  else if (finalScore >= 6) letterGrade = 'D';
  else if (finalScore >= 5) letterGrade = 'E';
  else letterGrade = 'F';

  return {
      score: finalScore.toFixed(2),
      grade: letterGrade,
      status: finalScore >= 5 ? 'Passed' : 'Failed'
  };
};

const ResultTeacherPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject] = useState('all');
  const [academicPeriod, setAcademicPeriod] = useState('Semester 1');
  const [periodType, setPeriodType] = useState('semester');
  
  const [students, setStudents] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [calculatedResults, setCalculatedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await request('/classes/teacher/me', 'GET');
        setClasses(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  const calculateResults = async () => {
    if (!selectedClass) {
      toast.error("Please select class");
      return;
    }
    
    setLoading(true);
    setInitialLoad(false);
    try {
      // 1. Get Students
      const resStudents = await request(`/students?class_id=${selectedClass}`, 'GET');
      const studentList = resStudents.data?.data || resStudents.data || [];
      
      // 2. Get Scores
      let url = `/scores?class_id=${selectedClass}`;
      if (selectedSubject !== 'all') {
        url += `&subject_id=${selectedSubject}`;
      }

      if (periodType === 'monthly' && academicPeriod) {
        const [year, month] = academicPeriod.split('-');
        const lastDay = new Date(year, month, 0).getDate();
        const from = `${academicPeriod}-01`;
        const to = `${academicPeriod}-${lastDay}`;
        url += `&date_from=${from}&date_to=${to}`;
      }

      const resScores = await request(url, 'GET');
      const scores = resScores.data?.data || resScores.data || [];

      // Extract unique assessment types
      const uniqueTypes = [...new Set(scores.map(s => s.assessment_type))].sort();
      setAssessmentTypes(uniqueTypes);

      // 3. Calculate
      const results = {};
      
      studentList.forEach(student => {
        const sId = student.student_id || student.id;
        const studentScores = scores.filter(s => (s.student_id || s.studentId) == sId);
        
        if (studentScores.length === 0) {
          results[sId] = { score: 0, grade: 'F', status: 'No Score' };
          return;
        }

        // Group by assessment type
        const typeGroups = {};
        studentScores.forEach(s => {
          const type = s.assessment_type;
          if (!typeGroups[type]) typeGroups[type] = [];
          typeGroups[type].push(Number(s.score));
        });

        // Average of each type
        const typeAverages = [];
        const typeScores = {};
        Object.keys(typeGroups).forEach(type => {
          const sum = typeGroups[type].reduce((a, b) => a + b, 0);
          const avg = sum / typeGroups[type].length;
          typeAverages.push(avg);
          typeScores[type] = avg.toFixed(2);
        });

        // Final Average: Sum of Type Averages / Number of Types
        if (typeAverages.length > 0) {
            const sumOfAverages = typeAverages.reduce((a, b) => a + b, 0);
            const finalScore = sumOfAverages / typeAverages.length;
            
            // Grading Scale (0-10)
            let letterGrade = 'F';
            if (finalScore >= 9) letterGrade = 'A';
            else if (finalScore >= 8) letterGrade = 'B';
            else if (finalScore >= 7) letterGrade = 'C';
            else if (finalScore >= 6) letterGrade = 'D';
            else if (finalScore >= 5) letterGrade = 'E';
            else letterGrade = 'F';

            results[sId] = {
                score: finalScore.toFixed(2),
                grade: letterGrade,
                status: finalScore >= 5 ? 'Passed' : 'Failed',
                typeScores
            };
        } else {
            results[sId] = { score: 0, grade: 'F', status: 'No Score' };
        }
      });

      setStudents(studentList);
      setCalculatedResults(results);
      toast.success("Results calculated successfully");

    } catch (err) {
      console.error(err);
      toast.error("Failed to calculate results");
    } finally {
      setLoading(false);
    }
  };

  const publishResults = async () => {
    if (!selectedClass || !selectedSubject) return;
    if (selectedSubject === 'all') {
      toast.error("Cannot publish 'All Subjects' result directly. Please publish per subject.");
      return;
    }
    if (Object.keys(calculatedResults).length === 0) {
        toast.error("No results to publish. Please calculate first.");
        return;
    }

    if (!window.confirm("Are you sure you want to publish these results? Existing results for this period will be updated.")) {
        return;
    }
    
    const payload = {
        class_id: Number(selectedClass),
        subject_id: Number(selectedSubject),
        academic_period: academicPeriod,
        results: Object.keys(calculatedResults).map(studentId => ({
            student_id: Number(studentId),
            score: Number(calculatedResults[studentId].score),
            grade: calculatedResults[studentId].grade,
            result_type: 'Average'
        }))
    };

    setPublishing(true);
    try {
        await request('/academic-results', 'POST', payload);
        toast.success("Results published successfully!");
    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to publish results");
    } finally {
        setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-kantumruy">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="text-indigo-600" />
              Academic Results
            </h1>
            <p className="text-gray-500 text-sm mt-1">Calculate and publish student grades</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Class Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Class</label>
                <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Period Selector */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Academic Period</label>
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                        <button 
                            onClick={() => {
                                setPeriodType('semester');
                                setAcademicPeriod('Semester 1');
                            }}
                            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                                periodType === 'semester' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Semester
                        </button>
                        <button 
                            onClick={() => {
                                setPeriodType('monthly');
                                const now = new Date();
                                const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                                setAcademicPeriod(currentMonth);
                            }}
                            className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                                periodType === 'monthly' 
                                ? 'bg-white text-indigo-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>
                {periodType === 'semester' ? (
                    <select 
                        value={academicPeriod} 
                        onChange={(e) => setAcademicPeriod(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Full Year">Full Year</option>
                    </select>
                ) : (
                    <input 
                        type="month"
                        value={academicPeriod}
                        onChange={(e) => setAcademicPeriod(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                )}
            </div>

            {/* Calculate Button */}
            <button 
                onClick={calculateResults}
                disabled={!selectedClass || loading}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Calculator size={20} />}
                Calculate Results
            </button>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={18} />
                    Calculated Grades
                </h3>
                {Object.keys(calculatedResults).length > 0 && selectedSubject !== 'all' && (
                    <button 
                        onClick={publishResults}
                        disabled={publishing}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {publishing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Publish Results
                    </button>
                )}
            </div>

            {students.length === 0 && !loading ? (
                <div className="p-12 text-center text-gray-500">
                    <div className="flex justify-center mb-3">
                        <Search size={48} className="text-gray-300" />
                    </div>
                    <p>{initialLoad ? "Select a class to start" : "No students found"}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="p-4 border-b">ID</th>
                                <th className="p-4 border-b">Student Name</th>
                                <th className="p-4 border-b">Gender</th>
                                {assessmentTypes.map(type => (
                                    <th key={type} className="p-4 border-b text-center">{type}</th>
                                ))}
                                <th className="p-4 border-b text-center">Calculated Score</th>
                                <th className="p-4 border-b text-center">Grade</th>
                                <th className="p-4 border-b text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map((student, index) => {
                                const sId = student.student_id || student.id;
                                const result = calculatedResults[sId] || { score: '-', grade: '-', status: '-' };
                                const isPassed = result.status === 'Passed';
                                
                                return (
                                    <tr key={sId} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-gray-500">{index + 1}</td>
                                        <td className="p-4 font-medium text-gray-900">
                                            {student.last_name} {student.first_name}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {student.gender}
                                        </td>
                                        {assessmentTypes.map(type => (
                                            <td key={type} className="p-4 text-center text-gray-600">
                                                {result.typeScores?.[type] || '-'}
                                            </td>
                                        ))}
                                        <td className="p-4 text-center font-bold text-gray-800">
                                            {result.score}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                result.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                                                result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                result.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                                result.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                                                result.grade === 'F' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                {result.grade}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {result.status !== '-' && (
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}>
                                                    {isPassed ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                    {result.status}
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
      </div>
    </div>
  )
}

export default ResultTeacherPage
