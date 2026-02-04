import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileText,
  Users,
  Calendar,
  Filter,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  School,
  FileSpreadsheet,
  Download,
  Loader2,
  Save
} from 'lucide-react';
import { request } from "../../util/request";
import toast from 'react-hot-toast';

// ==================== CONFIGURATION ====================

const MAX_SCORE = 10;

// ==================== MAIN COMPONENT ====================

const ScoreReportTeacherPage = () => {
  // State Management
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [academicPeriod, setAcademicPeriod] = useState('Semester 1');
  const [periodType, setPeriodType] = useState('semester');
  const [students, setStudents] = useState([]);
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState({});
  const [calculatedResults, setCalculatedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // New state for showing/hiding type scores
  const [showTypeScores, setShowTypeScores] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // ==================== EFFECTS ====================

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await request('/classes/teacher/me', 'GET');
        const classList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setClasses(classList);
        if (classList.length > 0 && !selectedClass) {
          setSelectedClass(classList[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  // Fetch Subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) return;
      try {
        const res = await request(`/classes/${selectedClass}`, 'GET');
        const schedules = res.data?.schedules || [];
        
        const uniqueSubjects = [];
        const seen = new Set();
        
        schedules.forEach(sch => {
          if (sch.subject_id && !seen.has(sch.subject_id)) {
            seen.add(sch.subject_id);
            uniqueSubjects.push({
              id: sch.subject_id,
              name: sch.subject_name
            });
          }
        });
        
        setSubjects(uniqueSubjects);
        setSelectedSubject('all');
      } catch (err) {
        console.error("Failed to load subjects:", err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== HELPER FUNCTIONS ====================

  const normalizeAssessmentType = (type, subjectName) => {
    if (subjectName.toLowerCase().includes('khmer') || subjectName.includes('ភាសាខ្មែរ')) {
      const typeMap = {
        'សមត្ថភាពស្តាប់': 'សមត្ថភាពស្តាប់',
        'សមត្ថភាពនិយាយ': 'សមត្ថភាពនិយាយ',
        'សមត្ថភាពអាន': 'សមត្ថភាពអាន',
        'សមត្ថភាពសរសេរ': 'សមត្ថភាពសរសេរ'
      };
      return typeMap[type] || type;
    }
    return type;
  };

  const calculateGrade = (average) => {
    if (average === '—' || average === '-') return '—';
    const num = parseFloat(average);
    if (num >= MAX_SCORE * 0.9) return 'ល្អ';
    if (num >= MAX_SCORE * 0.8) return 'ល្អបង្គួរ';
    if (num >= MAX_SCORE * 0.7) return 'ល្អមធ្យម';
    if (num >= MAX_SCORE * 0.6) return 'ខ្សាយ';
    if (num >= MAX_SCORE * 0.5) return 'ខ្សាយប់';
    return 'ខ្សាយ';
  };

  const getClassInfo = () => classes.find(c => c.id == selectedClass);
  const getSubjectName = () => subjects.find(s => s.id == selectedSubject)?.name || 'All Subjects';
  const subjectsWithData = Object.values(subjectGroups);

  // Calculate sum of scores for a specific subject and student
  const calculateSubjectSum = (studentId, subject) => {
    const result = calculatedResults[studentId];
    if (!result || !result.typeScores) return 0;
    
    let sum = 0;
    let count = 0;
    
    subject.types.forEach(type => {
      const score = result.typeScores?.[type.key];
      if (score !== undefined && score !== '-') {
        sum += parseFloat(score);
        count++;
      }
    });
    
    return count > 0 ? sum : 0;
  };

  // Calculate average of scores for a specific subject and student
  const calculateSubjectAverage = (studentId, subject) => {
    const result = calculatedResults[studentId];
    if (!result || !result.typeScores) return 0;
    
    let sum = 0;
    let count = 0;
    
    subject.types.forEach(type => {
      const score = result.typeScores?.[type.key];
      if (score !== undefined && score !== '-') {
        sum += parseFloat(score);
        count++;
      }
    });
    
    return count > 0 ? (sum / count).toFixed(2) : 0;
  };

  // Toggle all subjects
  const toggleAllSubjects = () => {
    const allExpanded = Object.values(expandedSubjects).every(Boolean);
    const newExpanded = {};
    subjectsWithData.forEach(subject => {
      newExpanded[subject.id] = !allExpanded;
    });
    setExpandedSubjects(newExpanded);
  };

  // Toggle specific subject
  const toggleSubject = (subjectId) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // ==================== MAIN FUNCTIONS ====================

  const calculateResults = async () => {
    if (!selectedClass) {
      toast.error("Please select a class");
      return;
    }
    
    setLoading(true);
    setInitialLoad(false);

    try {
      // 1. Fetch Students
      const resStudents = await request(`/students?class_id=${selectedClass}`, 'GET');
      const studentList = resStudents.data?.data || resStudents.data || [];
      
      // 2. Build Scores URL
      let url = `/scores?class_id=${selectedClass}`;
      if (selectedSubject !== 'all') {
        url += `&subject_id=${selectedSubject}`;
      }

      if (periodType === 'monthly' && academicPeriod) {
        const [year, month] = academicPeriod.split('-');
        const lastDay = new Date(year, month, 0).getDate();
        url += `&date_from=${academicPeriod}-01&date_to=${academicPeriod}-${lastDay}`;
      }

      // 3. Fetch Scores
      const resScores = await request(url, 'GET');
      const rawScores = resScores.data?.data || resScores.data || [];

      // 4. Normalize Assessment Types
      const scores = rawScores.map(s => ({
        ...s,
        assessment_type: normalizeAssessmentType(
          String(s.assessment_type || '').trim(),
          s.subject_name || ''
        )
      }));

      // 5. Group Scores by Subject
      const groupedSubjects = {};
      const seenCols = new Set();
      
      scores.forEach(s => {
        const sName = s.subject_name || 'Unknown';
        const sId = s.subject_id || sName;
        const key = `${sId}-${s.assessment_type}`;
        
        if (!seenCols.has(key)) {
          seenCols.add(key);
          
          if (!groupedSubjects[sId]) {
            groupedSubjects[sId] = {
              id: sId,
              name: sName,
              types: [],
              color: getSubjectColor(sName)
            };
          }
          
          groupedSubjects[sId].types.push({
            id: sId,
            name: sName,
            type: s.assessment_type,
            key
          });
        }
      });

      // 6. Sort Subjects and Types
      const subjectArray = Object.values(groupedSubjects);
      subjectArray.sort((a, b) => a.name.localeCompare(b.name));
      
      const uniqueColumns = [];
      subjectArray.forEach(subject => {
        subject.types.sort((a, b) => a.type.localeCompare(b.type));
        uniqueColumns.push(...subject.types);
      });

      setSubjectGroups(groupedSubjects);
      setAssessmentTypes(uniqueColumns);

      // Initialize expanded subjects (all collapsed by default)
      const initialExpanded = {};
      subjectArray.forEach(subject => {
        initialExpanded[subject.id] = false;
      });
      setExpandedSubjects(initialExpanded);

      // 7. Calculate Student Results
      const results = {};
      
      studentList.forEach(student => {
        const sId = student.student_id || student.id;
        const studentScores = scores.filter(s => (s.student_id || s.studentId) == sId);
        
        if (studentScores.length === 0) {
          results[sId] = { score: 0, grade: '—', status: 'No Score', typeScores: {} };
          return;
        }

        // Group by assessment type
        const typeGroups = {};
        studentScores.forEach(s => {
          const sName = s.subject_name || 'Unknown';
          const sId = s.subject_id || sName;
          const key = `${sId}-${s.assessment_type}`;
          if (!typeGroups[key]) typeGroups[key] = [];
          typeGroups[key].push(Number(s.score));
        });

        // Calculate averages
        const typeAverages = [];
        const typeScores = {};
        
        Object.keys(typeGroups).forEach(key => {
          const sum = typeGroups[key].reduce((a, b) => a + b, 0);
          const avg = sum / typeGroups[key].length;
          typeAverages.push(avg);
          typeScores[key] = parseFloat(avg.toFixed(2));
        });

        // Final Score and Grade
        if (typeAverages.length > 0) {
          const finalScore = typeAverages.reduce((a, b) => a + b, 0) / typeAverages.length;
          const letterGrade = calculateGrade(finalScore);

          results[sId] = {
            score: parseFloat(finalScore.toFixed(2)),
            grade: letterGrade,
            status: finalScore >= (MAX_SCORE / 2) ? 'ជាប់' : 'ធ្លាក់',
            typeScores
          };
        } else {
          results[sId] = { score: 0, grade: '—', status: 'No Score', typeScores: {} };
        }
      });

      // Calculate Ranks
      const sortedIds = Object.keys(results).sort((a, b) => {
        const resA = results[a];
        const resB = results[b];
        if (resA.status === 'No Score') return 1;
        if (resB.status === 'No Score') return -1;
        return resB.score - resA.score;
      });

      let currentRank = 1;
      sortedIds.forEach((id, index) => {
        const current = results[id];
        if (current.status === 'No Score') {
          current.rank = '-';
          return;
        }
        if (index > 0 && results[sortedIds[index - 1]].score > current.score) {
          currentRank = index + 1;
        }
        current.rank = currentRank;
      });

      setStudents(studentList);
      setCalculatedResults(results);

    } catch (err) {
      console.error(err);
      toast.error("សូមជ្រើសខែ និងសិក្សាដើម្បីគណនាពិន្ទុ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      calculateResults();
    }
  }, [selectedClass, selectedSubject, academicPeriod, periodType]);

  const publishResults = async () => {
    if (!selectedClass || !selectedSubject || selectedSubject === 'all') {
      toast.error("Please select a specific subject to publish results");
      return;
    }
    
    if (Object.keys(calculatedResults).length === 0) {
      toast.error("No results to publish. Calculate first.");
      return;
    }

    if (!window.confirm("Publish results? Existing results will be updated.")) return;
    
    const records = Object.keys(calculatedResults).map(studentId => {
      const result = calculatedResults[studentId];
      return {
        student_id: Number(studentId),
        class_id: Number(selectedClass),
        subject_id: Number(selectedSubject),
        academic_period: academicPeriod,
        final_grade: result.score === '-' || result.score === '—' ? 0 : Number(result.score),
        comments: result.grade === '-' || result.grade === '—' ? '' : result.grade
      };
    });

    setPublishing(true);
    try {
      await request('/academic-results', 'POST', { records });
      toast.success("Results published successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  // Helper function for subject colors
  const getSubjectColor = (subjectName) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-pink-500'
    ];
    
    const hash = subjectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // ==================== COMPUTED STATS ====================

  const stats = {
    total: students.length,
    passed: Object.values(calculatedResults).filter(r => r.status === 'ជាប់').length,
    failed: Object.values(calculatedResults).filter(r => r.status === 'ធ្លាក់').length,
    average: (() => {
      const validScores = Object.values(calculatedResults).filter(r => r.score !== '-');
      if (validScores.length === 0) return 0;
      return parseFloat((validScores.reduce((sum, r) => sum + parseFloat(r.score), 0) / validScores.length).toFixed(2));
    })()
  };

  const exportToExcel = () => {
    if (students.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ['No', 'ID', 'Name', 'Gender'];
    subjectsWithData.forEach(subject => {
      if (showTypeScores && expandedSubjects[subject.id]) {
        subject.types.forEach(type => headers.push(`${subject.name} - ${type.type}`));
      } else {
        headers.push(subject.name);
      }
    });
    headers.push('Score', 'Grade', 'Rank');

    const rows = students.map((student, idx) => {
      const sId = student.student_id || student.id;
      const result = calculatedResults[sId] || {};
      
      const row = [
        idx + 1,
        student.student_code || sId,
        `${student.last_name} ${student.first_name}`,
        student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'
      ];

      subjectsWithData.forEach(subject => {
        if (showTypeScores && expandedSubjects[subject.id]) {
          subject.types.forEach(type => {
            row.push(result.typeScores?.[type.key] || '-');
          });
        } else {
          if (!showTypeScores) {
             const subjectScores = subject.types
                .map(type => result.typeScores?.[type.key])
                .filter(score => score !== undefined);
             const avg = subjectScores.length > 0
                ? parseFloat((subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length).toFixed(2))
                : '-';
             row.push(avg);
          } else {
             row.push(parseFloat(calculateSubjectSum(sId, subject).toFixed(2)));
          }
        }
      });

      row.push(result.score || '-');
      row.push(result.grade || '-');
      row.push(result.rank || '-');
      
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Score_Report_${selectedClass}_${academicPeriod}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (students.length === 0) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Note: To support Khmer text, ensure you have the font loaded (e.g. KHMER_FONT_BASE64)
    // doc.addFileToVFS("KantumruyPro.ttf", KHMER_FONT_BASE64);
    // doc.addFont("KantumruyPro.ttf", "Kantumruy", "normal");
    // doc.setFont("Kantumruy");

    doc.setFontSize(14);
    doc.text("Score Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Class: ${getClassInfo()?.name || selectedClass} | Period: ${academicPeriod}`, 14, 22);

    const headers = [['No', 'ID', 'Name', 'Gender']];
    subjectsWithData.forEach(subject => {
        if (showTypeScores && expandedSubjects[subject.id]) {
            subject.types.forEach(type => headers[0].push(`${subject.name}\n${type.type}`));
        } else {
            headers[0].push(subject.name);
        }
    });
    headers[0].push('Avg', 'Grade', 'Rank');

    // Re-use row generation logic (same as Excel but for autoTable)
    // For brevity, we call the same logic or duplicate it here. 
    // Since we can't easily share the map function without extracting it, we duplicate the row mapping logic:
    const rows = students.map((student, idx) => {
      const sId = student.student_id || student.id;
      const result = calculatedResults[sId] || {};
      const row = [
        idx + 1,
        student.student_code || sId,
        `${student.last_name} ${student.first_name}`,
        student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'
      ];
      subjectsWithData.forEach(subject => {
        if (showTypeScores && expandedSubjects[subject.id]) {
          subject.types.forEach(type => {
            row.push(result.typeScores?.[type.key] || '-');
          });
        } else {
          if (!showTypeScores) {
             const subjectScores = subject.types
                .map(type => result.typeScores?.[type.key])
                .filter(score => score !== undefined);
             const avg = subjectScores.length > 0
                ? parseFloat((subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length).toFixed(2))
                : '-';
             row.push(avg);
          } else {
             row.push(parseFloat(calculateSubjectSum(sId, subject).toFixed(2)));
          }
        }
      });
      row.push(result.score || '-');
      row.push(result.grade || '-');
      row.push(result.rank || '-');
      return row;
    });

    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 }, // Add font: "Kantumruy" here if font is loaded
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Score_Report_${selectedClass}_${academicPeriod}.pdf`);
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen  pb-20">
      <div className="max-w-8xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Modern Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="text-indigo-600" size={24} />
                  គណនាពិន្ទុសិស្សសម្រាប់ការសិក្សាពាក់កណ្តាលឆ្នាំ និងប្រចាំខែ
                </h2>
                <p className="text-gray-500 text-sm mt-1">ប្រើប្រាស់ប៊ូតុងទាំងនេះដើម្បីគ្រប់គ្រងការបង្ហាញពិន្ទុ</p>
              </div>
              
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={students.length === 0}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <Download size={18} />
                  ទាញយកទិន្នន័យ
                  <ChevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <button
                      onClick={exportToExcel}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-emerald-50 transition-colors"
                    >
                      <FileSpreadsheet size={18} className="text-emerald-600" />
                      Export to Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                    >
                      <FileText size={18} className="text-red-600" />
                      Export to PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Class Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  ជ្រើសរើសថ្នាក់
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="">ជ្រើសរើសថ្នាក់...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Period Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  ប្រភេទរយៈពេល
                </label>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => {
                      setPeriodType('semester');
                      setAcademicPeriod('Semester 1');
                    }} 
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      periodType === 'semester' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-indigo-200' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Calendar size={16} />
                    ពាក់កណ្តាលឆ្នាំ
                  </button>
                  <button 
                    onClick={() => {
                      setPeriodType('monthly');
                      const d = new Date();
                      d.setDate(1);
                      d.setMonth(d.getMonth() - 1);
                      const lastMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      setAcademicPeriod(lastMonth);
                    }} 
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      periodType === 'monthly' 
                        ? 'bg-white text-indigo-600 shadow-sm border border-indigo-200' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Calendar size={16} />
                    ប្រចាំខែ
                  </button>
                </div>
              </div>

              {/* Academic Period Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  {periodType === 'semester' ? 'ពាក់កណ្តាលឆ្នាំ' : 'ខែ'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  {periodType === 'semester' ? (
                    <select 
                      value={academicPeriod} 
                      onChange={(e) => setAcademicPeriod(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:border-gray-400 appearance-none cursor-pointer"
                    >
                      <option value="Semester 1">ពាក់កណ្តាលឆ្នាំទី១</option>
                      <option value="Semester 2">ពាក់កណ្តាលឆ្នាំទី២</option>
                    </select>
                  ) : (
                    <input 
                      type="month" 
                      value={academicPeriod}
                      onChange={(e) => setAcademicPeriod(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all hover:border-gray-400 cursor-pointer"
                    />
                  )}
                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end gap-3">
              {Object.keys(calculatedResults).length > 0 && selectedSubject !== 'all' && (
                <>
                  <button 
                    onClick={() => setCalculatedResults({})}
                    disabled={publishing}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all h-[42px]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={publishResults}
                    disabled={publishing}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Publish Result
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Table Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} />
                  Calculated Grades
                </h3>
                {Object.keys(calculatedResults).length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 font-medium">
                      {students.length} students • {getSubjectName()}
                    </p>
                  </div>
                )}
              </div>
              {Object.keys(calculatedResults).length > 0 && showTypeScores && subjectsWithData.length > 0 && (
                <button 
                  onClick={toggleAllSubjects}
                  className="text-xs font-normal px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                >
                  {Object.values(expandedSubjects).every(Boolean) ? 'មើលពិន្ទុលម្អិត' : 'មើលពិន្ទុសរុប'}
                  {Object.values(expandedSubjects).every(Boolean) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
              )}
            </div>
          </div>

          {/* Table Content */}
          {students.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              {initialLoad ? (
                <>
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Filter size={32} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-600 text-lg">Select class & subject to calculate</p>
                  <p className="text-sm text-gray-400 mt-1">Results will appear here</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Users size={32} className="text-gray-300" />
                  </div>
                  <p className="font-medium text-gray-600 text-lg">No students found</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  {/* Row 1: Main Headers */}
                  <tr className="bg-white border-b-2 border-gray-200">
                    <th className="px-3 py-3 text-center font-bold text-gray-700 border-r border-gray-200 bg-gray-50" rowSpan={showTypeScores ? "2" : "1"}>
                      <div className="text-xs">ល.រ</div>
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-200 min-w-[120px] bg-gray-50" rowSpan={showTypeScores ? "2" : "1"}>
                      <div className="text-xs">ឈ្មោះសិស្ស</div>
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-gray-700 border-r-2 border-gray-300 bg-gray-50" rowSpan={showTypeScores ? "2" : "1"}>
                      <div className="text-xs">ភេទ</div>
                    </th>
                    
                    {showTypeScores ? (
                      <>
                        {/* Subject Group Headers - Detailed View */}
                        {subjectsWithData.map((subject, idx) => (
                          <th 
                            key={subject.id} 
                            className={`px-2 py-3 text-center font-bold text-gray-800 bg-gradient-to-b from-blue-50 to-blue-100/50 ${
                              idx === 0 ? '' : 'border-l-2 border-gray-300'
                            }`}
                            colSpan={subject.types.length}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full ${subject.color}`}
                              ></div>
                              <span className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                                {subject.name}
                              </span>
                              <button 
                                onClick={() => toggleSubject(subject.id)}
                                className="ml-1 p-1 hover:bg-blue-200/30 rounded transition-colors"
                                title={expandedSubjects[subject.id] ? "Collapse to see sum" : "Expand to see details"}
                              >
                                {expandedSubjects[subject.id] ? (
                                  <ChevronDown size={12} className="text-gray-600" />
                                ) : (
                                  <ChevronRight size={12} className="text-gray-600" />
                                )}
                              </button>
                            </div>
                          </th>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* Subject Group Headers - Compact View */}
                        {subjectsWithData.map((subject, idx) => (
                          <th 
                            key={subject.id} 
                            className={`px-3 py-3 text-center font-bold text-gray-800 bg-gradient-to-b from-blue-50 to-blue-100/50 ${
                              idx === 0 ? '' : 'border-l-2 border-gray-300'
                            }`}
                          >
                            <div className="text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                              {subject.name}
                            </div>
                            <div className="text-[9px] text-gray-600 mt-1">
                              {subject.types.length} assessments
                            </div>
                          </th>
                        ))}
                      </>
                    )}

                    <th className="px-3 py-3 text-center bg-gradient-to-b from-indigo-50 to-indigo-100 border-l-2 border-indigo-300 font-bold text-indigo-900" rowSpan={showTypeScores ? "2" : "1"}>
                      <div className="text-xs">មធ្យម<br/>ភាគ</div>
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-gray-700 border-l border-gray-200 bg-gray-50" rowSpan={showTypeScores ? "2" : "1"}>
                      <div className="text-xs">និទ្ទេស</div>
                    </th>
                    <th className="px-3 py-3 text-center font-bold text-gray-700 border-l border-gray-200 bg-gray-50" rowSpan={showTypeScores ? "2" : "1"}>
                      <div className="text-xs">ចំណាត់ថ្នាក់</div>
                    </th>
                  </tr>
                  
                  {/* Row 2: Assessment Type Sub-headers (only in detailed view) */}
                  {showTypeScores && (
                    <tr className="bg-white border-b-2 border-gray-200">
                      {subjectsWithData.map((subject, subjectIdx) =>
                        expandedSubjects[subject.id] ? (
                          subject.types.map((type, typeIdx) => (
                            <th 
                              key={type.key} 
                              className={`px-2 py-2 text-center min-w-[65px] bg-blue-50/30 ${
                                typeIdx === 0 && subjectIdx > 0 ? 'border-l-2 border-gray-300' : 'border-l border-gray-100'
                              }`}
                            >
                              <div className="text-[9px] uppercase tracking-wide text-gray-700 font-semibold whitespace-nowrap">
                                {type.type}
                              </div>
                            </th>
                          ))
                        ) : (
                          <th 
                            key={`collapsed-${subject.id}`}
                            className="px-2 py-2 text-center bg-blue-50/30 border-l-2 border-gray-300"
                            colSpan={subject.types.length}
                          >
                            <div className="text-[9px] text-gray-700 font-semibold flex items-center justify-center gap-1">
                              <Plus size={10} />
                              ពិន្ទុសរុប
                            </div>
                          </th>
                        )
                      )}
                    </tr>
                  )}
                </thead>
                
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, idx) => {
                    const sId = student.student_id || student.id;
                    const result = calculatedResults[sId] || { 
                      score: '-', 
                      grade: '-', 
                      status: '-',
                      typeScores: {}
                    };

                    return (
                      <tr key={sId} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-3 py-4 text-center text-gray-500 font-medium border-r border-gray-100 bg-gray-50/50">
                          {idx + 1}
                        </td>
                        
                        <td className="px-4 py-4 border-r border-gray-100">
                          <div className="font-semibold text-gray-900 text-sm">
                            {student.last_name} {student.first_name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            {student.student_code}
                          </div>
                        </td>
                        
                        <td className="px-3 py-4 text-center border-r-2 border-gray-200">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-bold ${
                            student.gender === 'Female' 
                              ? 'bg-pink-100 text-pink-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {student.gender === 'Female' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>

                        {/* Assessment Scores */}
                        {subjectsWithData.map((subject, subjectIdx) => {
                          if (!showTypeScores) {
                            // Compact view - show subject average only
                            const subjectScores = subject.types
                              .map(type => result.typeScores?.[type.key])
                              .filter(score => score !== undefined);
                            
                            const subjectAverage = subjectScores.length > 0
                              ? parseFloat((subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length).toFixed(2))
                              : '-';

                            return (
                              <td 
                                key={`compact-${subject.id}`}
                                className={`px-3 py-4 text-center text-sm font-medium ${
                                  subjectIdx > 0 ? 'border-l-2 border-gray-200' : ''
                                }`}
                              >
                                <span className="text-gray-700 font-bold text-base">
                                  {subjectAverage}
                                </span>
                              </td>
                            );
                          }

                          // Detailed view - show all type scores or sum when collapsed
                          return expandedSubjects[subject.id] ? (
                            // Expanded view - show each assessment type score
                            subject.types.map((type, typeIdx) => (
                              <td 
                                key={type.key} 
                                className={`px-2 py-4 text-center text-sm font-medium ${
                                  typeIdx === 0 && subjectIdx > 0 ? 'border-l-2 border-gray-200' : 'border-l border-gray-50'
                                }`}
                              >
                                {result.typeScores?.[type.key] ? (
                                  <span className="text-gray-700 font-semibold">
                                    {result.typeScores[type.key]}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-xs">-</span>
                                )}
                              </td>
                            ))
                          ) : (
                            // Collapsed view - show sum of scores
                            <td 
                              key={`collapsed-${subject.id}`}
                              className="px-3 py-4 text-center border-l-2 border-gray-200 bg-gray-50/30 group-hover:bg-gray-50/50 transition-colors"
                              colSpan={subject.types.length}
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                  
                                  {parseFloat(calculateSubjectSum(sId, subject).toFixed(2))}
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        <td className="px-3 py-4 text-center bg-indigo-50/20 border-l-2 border-indigo-200 group-hover:bg-indigo-50/40 transition-colors">
                          <span className="font-bold text-gray-900 text-base">
                            {result.score}
                          </span>
                        </td>
                        
                        <td className="px-3 py-4 text-center border-l border-gray-100">
                          {result.grade !== '-' && result.grade !== '—' ? (
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-lg font-bold text-xs shadow-sm ${
                              result.grade === 'ល្អ' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                              result.grade === 'ល្អបង្គួរ' ? 'bg-teal-100 text-teal-700 border border-teal-200' :
                              result.grade === 'ល្អមធ្យម' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              result.grade === 'ខ្សាយ' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                              result.grade === 'ខ្សាយប់' ? 'bg-red-100 text-red-700 border border-red-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {result.grade}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>

                        <td className="px-3 py-4 text-center border-l border-gray-100">
                          <span className="font-bold text-gray-900">
                            {result.rank || '-'}
                          </span>
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
  );
};

export default ScoreReportTeacherPage;