import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FileText, Loader2, Save, Calculator, AlertCircle, CheckCircle2, RotateCcw,
  Calendar, Users, BookOpen, Search, Filter, Download, Upload, Eye, EyeOff,
  ChevronDown, FileSpreadsheet, Printer
} from 'lucide-react';
import { request } from "../../util/request";
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ==================== CONFIGURATION ====================

const MAX_SCORE = 10;

const getAssessmentOptions = (subjectName = '') => {
  const name = subjectName.toLowerCase();
  
  if (name.includes('math') || name.includes('គណិត')) {
    return [
      { value: "ចំនួន", label: "ចំនួន", weight: 0.2 },
      { value: "រង្វាស់រង្វាល់", label: "រង្វាស់រង្វាល់", weight: 0.2 },
      { value: "ធរណីមាត្រ", label: "ធរណីមាត្រ", weight: 0.2 },
      { value: "ពីជគណិត", label: "ពីជគណិត", weight: 0.2 },
      { value: "ស្ថិតិ", label: "ស្ថិតិ", weight: 0.2 }
    ];
  }
  
  if (name.includes('science') || name.includes('វិទ្យាសាស្ត្រ')) {
    return [
      { value: "ជីវវិទ្យា", label: "ជីវវិទ្យា", weight: 0.25 },
      { value: "គីមីវិទ្យា", label: "គីមីវិទ្យា", weight: 0.25 },
      { value: "រូបវិទ្យា", label: "រូបវិទ្យា", weight: 0.25 },
      { value: "ផែនដី-បរិស្ថានវិទ្យា", label: "ផែនដី-បរិស្ថានវិទ្យា", weight: 0.25 }
    ];
  }
  
  if (name.includes('social') || name.includes('សិក្សាសង្គម')) {
    return [
      { value: "សីលធម៌-ពលរដ្ឋវិជ្ជា", label: "សីលធម៌-ពលរដ្ឋវិជ្ជា", weight: 0.25 },
      { value: "ភូមិវិទ្យា", label: "ភូមិវិទ្យា", weight: 0.25 },
      { value: "ប្រវត្តិវិទ្យា", label: "ប្រវត្តិវិទ្យា", weight: 0.25 },
      { value: "គេហវិទ្យា-អប់រំសិល្បៈ", label: "គេហវិទ្យា-អប់រំសិល្បៈ", weight: 0.25 }
    ];
  }
  
  if (name.includes('sport') || name.includes('អប់រំកាយ')) {
    return [
      { value: "សុខភាព-អនាម័យ", label: "សុខភាព-អនាម័យ", weight: 0.5 },
      { value: "អប់រំបំណិនជីវិត", label: "អប់រំបំណិនជីវិត", weight: 0.5 }
    ];
  }
  
  if (name.includes('khmer') || name.includes('ភាសាខ្មែរ')) {
    return [
      { value: "សមត្ថភាពស្តាប់", label: "សមត្ថភាពស្តាប់", weight: 0.25 },
      { value: "សមត្ថភាពនិយាយ", label: "សមត្ថភាពនិយាយ", weight: 0.25 },
      { value: "សមត្ថភាពអាន", label: "សមត្ថភាពអាន", weight: 0.25 },
      { value: "សមត្ថភាពសរសេរ", label: "សមត្ថភាពសរសេរ", weight: 0.25 }
    ];
  }
  
  return [
    { value: "ការស្តាប់", label: "ការស្តាប់", weight: 0.25 },
    { value: "ការនិយាយ", label: "ការនិយាយ", weight: 0.25 },
    { value: "ការអាន", label: "ការអាន", weight: 0.25 },
    { value: "ការសរសេរ", label: "ការសរសេរ", weight: 0.25 }
  ];
};

// ==================== MAIN COMPONENT ====================

const ScoreTeacherPage = () => {
  // State
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [scores, setScores] = useState({});
  const [scoreMeta, setScoreMeta] = useState({});
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedDate, setLastSavedDate] = useState('');
  const [showOnlyUnscored, setShowOnlyUnscored] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Refs
  const exportMenuRef = useRef(null);
  const prevDateRef = useRef('');
  const prevClassRef = useRef('');
  const prevSubjectRef = useRef('');
  const initialLoadRef = useRef(false);

  // ==================== EFFECTS ====================

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

  // Load classes
  useEffect(() => {
    (async () => {
      try {
        const res = await request('/classes/teacher/me', 'GET');
        const classesData = res.data || res || [];
        setClasses(classesData);
        if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error("មិនអាចទាញយកថ្នាក់បានទេ");
      } finally {
        setLoadingClasses(false);
      }
    })();
  }, []);

  // Load students + subjects when class changes
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSubjects([]);
      setSelectedSubject('');
      setScores({});
      setScoreMeta({});
      setHasData(false);
      return;
    }

    (async () => {
      try {
        const [clsRes, stuRes] = await Promise.all([
          request(`/classes/${selectedClass}`, 'GET'),
          request(`/students?class_id=${selectedClass}`, 'GET')
        ]);

        const studentList = stuRes.data?.data || stuRes.data || stuRes || [];
        setStudents(studentList);

        const schedules = clsRes.data?.schedules || [];
        const seen = new Set();
        const subs = [];
        for (const sch of schedules) {
          if (sch.subject_id && !seen.has(sch.subject_id)) {
            seen.add(sch.subject_id);
            subs.push({
              id: sch.subject_id,
              name: sch.subject_name,
              code: sch.subject_code
            });
          }
        }
        setSubjects(subs);
        if (subs.length > 0 && !initialLoadRef.current) {
          setSelectedSubject(subs[0].id);
          initialLoadRef.current = true;
        }
      } catch (err) {
        console.error(err);
        toast.error("មិនអាចទាញយកទិន្នន័យបានទេ");
      }
    })();
  }, [selectedClass]);

  // Derived values
  const subjectName = useMemo(() =>
    subjects.find(s => String(s.id) === selectedSubject)?.name || '',
    [subjects, selectedSubject]
  );

  const options = useMemo(() => getAssessmentOptions(subjectName), [subjectName]);

  // Load scores
  const loadScores = useCallback(async (force = false, silent = false) => {
    if (!selectedClass || !selectedSubject || !date) {
      setHasData(false);
      return;
    }

    if (hasUnsavedChanges && !force) {
      const shouldLoad = window.confirm(
        "អ្នកមានការផ្លាស់ប្តូរដែលមិនទាន់រក្សាទុក។ តើអ្នកពិតជាចង់ទាញយកទិន្នន័យថ្មីដែរឬទេ?"
      );
      if (!shouldLoad) return;
    }

    setFetching(true);
    setScores({});
    setScoreMeta({});
    setHasData(false);

    try {
      const [y, m] = date.split('-');
      const lastDay = new Date(y, m, 0).getDate();
      const from = `${date}-01`;
      const to = `${date}-${lastDay}`;

      const res = await request(
        `/scores?class_id=${selectedClass}&subject_id=${selectedSubject}&date_from=${from}&date_to=${to}`,
        'GET'
      );

      const records = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      if (records.length === 0) {
        if (!silent) toast("គ្មានទិន្នន័យពិន្ទុសម្រាប់ខែនេះទេ", { icon: 'ℹ️' });
        setHasData(false);
      } else {
        const matrix = {};
        const meta = {};
        
        records.forEach(r => {
          const sid = String(r.student_id || r.studentId || '');
          let type = String(r.assessment_type || '').trim();
          const score = r.score != null ? String(parseFloat(r.score)) : '';

          // Map legacy types
          if (subjectName.toLowerCase().includes('khmer') || subjectName.includes('ភាសាខ្មែរ')) {
            const typeMap = {
              'សមត្ថភាពស្តាប់': 'សមត្ថភាពស្តាប់',
              'សមត្ថភាពនិយាយ': 'សមត្ថភាពនិយាយ',
              'សមត្ថភាពអាន': 'សមត្ថភាពអាន',
              'សមត្ថភាពសរសេរ': 'សមត្ថភាពសរសេរ'
            };
            type = typeMap[type] || type;
          }

          if (sid && type) {
            if (!matrix[sid]) matrix[sid] = {};
            matrix[sid][type] = score;
            
            if (!meta[sid]) meta[sid] = {};
            meta[sid][type] = { date_recorded: r.date_recorded };
          }
        });

        setScores(matrix);
        setScoreMeta(meta);
        setHasData(true);
        setHasUnsavedChanges(false);
        setLastSavedDate(date);
      }
    } catch (err) {
      console.error("Load scores failed:", err);
      if (!silent) toast.error(err.response?.data?.message || "មិនអាចទាញយកពិន្ទុបានទេ");
      setHasData(false);
    } finally {
      setFetching(false);
    }
  }, [selectedClass, selectedSubject, date, hasUnsavedChanges, subjectName]);

  // Auto-load scores when filters change
  useEffect(() => {
    if (!prevDateRef.current && !prevClassRef.current && !prevSubjectRef.current) {
      prevDateRef.current = date;
      prevClassRef.current = selectedClass;
      prevSubjectRef.current = selectedSubject;
      return;
    }

    const hasChanged = 
      (prevDateRef.current !== date && date !== '') ||
      (prevClassRef.current !== selectedClass && selectedClass !== '') ||
      (prevSubjectRef.current !== selectedSubject && selectedSubject !== '');

    if (selectedClass && selectedSubject && date && hasChanged) {
      loadScores();
      prevDateRef.current = date;
      prevClassRef.current = selectedClass;
      prevSubjectRef.current = selectedSubject;
    }
  }, [selectedClass, selectedSubject, date, loadScores]);

  // ==================== HANDLERS ====================

  const handleChange = (sid, type, value) => {
    if (value === '' || (/^\d{0,3}(\.\d{0,2})?$/.test(value) && (value === '' || Number(value) <= MAX_SCORE))) {
      const currentValue = scores[sid]?.[type] || '';

      setScores(prev => ({
        ...prev,
        [sid]: { ...prev[sid], [type]: value }
      }));

      if (currentValue !== value) {
        setHasUnsavedChanges(true);
      }
    }
  };

  const calculateAverage = (sid) => {
    const s = scores[sid] || {};
    let sum = 0, cnt = 0;
    
    options.forEach(o => {
      const v = s[o.value];
      if (v !== '' && v !== undefined) {
        const n = Number(v);
        if (!isNaN(n)) {
          sum += n * (o.weight || 1);
          cnt += (o.weight || 1);
        }
      }
    });
    
    return cnt === 0 ? '—' : parseFloat((sum / cnt).toFixed(2));
  };

  const getGrade = (average) => {
    if (average === '—') return '—';
    const num = parseFloat(average);
    if (num >= MAX_SCORE * 0.9) return 'ល្អ';
    if (num >= MAX_SCORE * 0.8) return 'ល្អបង្គួរ';
    if (num >= MAX_SCORE * 0.7) return 'ល្អមធ្យម';
    if (num >= MAX_SCORE * 0.6) return 'ខ្សាយ';
    if (num >= MAX_SCORE * 0.5) return 'ខ្សាយប់';
    return 'ខ្សាយ';
  };

  const save = async () => {
    if (!selectedClass || !selectedSubject || !date) {
      return toast.error("សូមជ្រើសរើសព័ត៌មានគ្រប់គ្រាន់");
    }

    setSubmitting(true);

    try {
      const payload = [];
      
      students.forEach(stu => {
        const sid = String(stu.student_id || stu.id || '');
        if (!sid) return;
        
        const row = scores[sid] || {};
        const metaRow = scoreMeta[sid] || {};

        options.forEach(o => {
          const val = row[o.value];
          if (val !== '' && val !== undefined) {
            let recordDate = `${date}-15`;
            const existingMeta = metaRow[o.value];
            
            if (existingMeta?.date_recorded) {
              const raw = existingMeta.date_recorded;
              const dateStr = raw instanceof Date ? raw.toISOString() : String(raw);
              if (dateStr.startsWith(date)) {
                recordDate = dateStr.substring(0, 10);
              }
            }

            payload.push({
              student_id: sid,
              class_id: Number(selectedClass),
              subject_id: Number(selectedSubject),
              assessment_type: o.value,
              score: Number(val),
              date_recorded: recordDate
            });
          }
        });
      });

      if (payload.length === 0) {
        toast.error("គ្មានពិន្ទុត្រូវរក្សាទុកទេ");
        return;
      }

      await request('/scores', 'POST', { records: payload });
      toast.success(`រក្សាទុកពិន្ទុជោគជ័យ`);
      setHasUnsavedChanges(false);
      setLastSavedDate(date);
      loadScores(true, true);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "ការរក្សាទុកបរាជ័យ");
    } finally {
      setSubmitting(false);
    }
  };

  const resetScores = () => {
    if (hasUnsavedChanges) {
      const confirmReset = window.confirm(
        "អ្នកមានការផ្លាស់ប្តូរដែលមិនទាន់រក្សាទុក។ តើអ្នកពិតជាចង់កំណត់ឡើងវិញដែរឬទេ?"
      );
      if (!confirmReset) return;
    }
    setScores({});
    setScoreMeta({});
    setHasUnsavedChanges(false);
    toast.success("បានកំណត់ពិន្ទុឡើងវិញ");
  };

const exportToExcel = () => {
  if (filteredStudents.length === 0) {
    toast.error("គ្មានទិន្នន័យត្រូវនាំចេញ");
    return;
  }

  const headers = ['ល.រ', 'ID', 'ឈ្មោះ', 'ភេទ', 'ថ្ងៃកំណើត', ...options.map(o => o.label), 'មធ្យមភាគ', 'ថ្នាក់', 'ស្ថានភាព'];
  
  const rows = filteredStudents.map((stu, index) => {
    const sid = String(stu.student_id || stu.id || '');
    const average = calculateAverage(sid);
    return [
      index + 1,
      sid,
      `${stu.last_name} ${stu.first_name}`,
      stu.gender === 'Female' || stu.gender?.toLowerCase() === 'ស្រី' ? 'ស្រី' : 'ប្រុស',
      stu.date_of_birth ? new Date(stu.date_of_birth).toLocaleDateString('km') : '—',
      ...options.map(o => scores[sid]?.[o.value] ?? '—'),
      average,
      getGrade(average),
      average === '—' ? 'គ្មានពិន្ទុ' : (parseFloat(average) >= (MAX_SCORE / 2) ? 'ជាប់' : 'ធ្លាក់')
    ];
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // CRITICAL: Add UTF-8 BOM (\uFEFF) so Excel recognizes Khmer characters
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ពិន្ទុ_${selectedClass}_${subjectName}_${date}.csv`;
  link.click();
  setShowExportMenu(false);
};

const exportToPDF = () => {
  if (filteredStudents.length === 0) {
    toast.error("គ្មានទិន្នន័យត្រូវនាំចេញ");
    return;
  }

  const doc = new jsPDF();

  // 1. Add and register the Khmer font
  // Ensure KHMER_FONT_BASE64 is imported from your config file
  doc.addFileToVFS("KantumruyPro.ttf", KHMER_FONT_BASE64);
  doc.addFont("KantumruyPro.ttf", "Kantumruy", "normal");
  
  // 2. Set the registered font
  doc.setFont("Kantumruy");

  doc.setFontSize(18);
  doc.text("របាយការណ៍លទ្ធផលសិក្សាសិស្ស", 105, 20, { align: "center" });
  
  doc.setFontSize(11);
  doc.text(`ថ្នាក់: ${selectedClass} | មុខវិជ្ជា: ${subjectName}`, 14, 30);
  doc.text(`ខែ: ${date}`, 14, 36);

  const tableColumn = [
    "ល.រ", "អត្តលេខ", "ឈ្មោះ", "ភេទ",
    ...options.map(o => o.label),
    "មធ្យម", "និទ្ទេស", "លទ្ធផល"
  ];

  const tableRows = filteredStudents.map((stu, index) => {
    const sid = String(stu.student_id || stu.id || '');
    const average = calculateAverage(sid);
    const grade = getGrade(average);
    const status = average === '—' ? 'គ្មានពិន្ទុ' : (parseFloat(average) >= (MAX_SCORE / 2) ? 'ជាប់' : 'ធ្លាក់');
    
    return [
      index + 1,
      sid,
      `${stu.last_name} ${stu.first_name}`,
      stu.gender === 'Female' || stu.gender?.toLowerCase() === 'ស្រី' ? 'ស្រី' : 'ប្រុស',
      ...options.map(o => scores[sid]?.[o.value] ?? '-'),
      average,
      grade,
      status
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    styles: { 
      font: "Kantumruy", // Apply Khmer font to table
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: { fillColor: [22, 163, 74] },
  });

  doc.save(`Score_Report_${date}.pdf`);
  setShowExportMenu(false);
};

  // ==================== FILTERING ====================

  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(stu => {
        const fullName = `${stu.last_name} ${stu.first_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
    }

    if (selectedOption !== 'all') {
      filtered = filtered.filter(stu => {
        const sid = String(stu.student_id || stu.id || '');
        const average = calculateAverage(sid);

        if (selectedOption === 'no-score') return average === '—';
        if (selectedOption === 'passed') return average !== '—' && parseFloat(average) >= (MAX_SCORE / 2);
        if (selectedOption === 'failed') return average !== '—' && parseFloat(average) < (MAX_SCORE / 2);
        return true;
      });
    }

    if (showOnlyUnscored) {
      filtered = filtered.filter(stu => {
        const sid = String(stu.student_id || stu.id || '');
        const studentScores = scores[sid] || {};
        return !options.some(o => studentScores[o.value] && studentScores[o.value] !== '');
      });
    }

    return filtered;
  }, [students, searchTerm, selectedOption, showOnlyUnscored, scores, options]);

  const classStats = useMemo(() => {
    const stats = { total: filteredStudents.length, passed: 0, failed: 0, noScore: 0 };
    filteredStudents.forEach(stu => {
      const sid = String(stu.student_id || stu.id || '');
      const average = calculateAverage(sid);
      if (average === '—') stats.noScore++;
      else if (parseFloat(average) >= (MAX_SCORE / 2)) stats.passed++;
      else stats.failed++;
    });
    return stats;
  }, [filteredStudents, scores, options]);

  // ==================== RENDER ====================

  if (loadingClasses) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="animate-spin mb-4 text-blue-600 mx-auto" size={48} />
          <p className="text-gray-600 font-medium text-lg">កំពុងទាញយកទិន្នន័យ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ</h1>
              <p className="text-gray-500">បញ្ចូល និងគ្រប់គ្រងពិន្ទុសិស្សប្រចាំខែ</p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  <AlertCircle size={18} />
                  <span className="font-medium text-sm">មិនទាន់រក្សាទុក</span>
                </div>
              )}
              
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={filteredStudents.length === 0}
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
          </div>
        </div>

        {/* Filters d*/}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users size={16} className="text-blue-500" />
                ថ្នាក់រៀន
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject('');
                  setScores({});
                  setScoreMeta({});
                  setHasUnsavedChanges(false);
                }}
                className="w-full rounded-lg border-gray-300 border bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">ជ្រើសរើសថ្នាក់</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.grade ? `- ថ្នាក់ទី ${c.grade}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen size={16} className="text-blue-500" />
                មុខវិជ្ជា
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setScores({});
                  setScoreMeta({});
                  setHasUnsavedChanges(false);
                }}
                disabled={!selectedClass}
                className="w-full rounded-lg border-gray-300 border bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50"
              >
                <option value="">ជ្រើសរើសមុខវិជ្ជា</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.code ? `(${s.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={16} className="text-blue-500" />
                ខែ
              </label>
              <input
                type="month"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 border bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Filter size={16} className="text-blue-500" />
                លក្ខខណ្ឌ
              </label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full rounded-lg border-gray-300 border bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="all">បង្ហាញទាំងអស់</option>
                <option value="passed">សិស្សជាប់</option>
                <option value="failed">សិស្សធ្លាក់</option>
                <option value="no-score">មិនទាន់មានពិន្ទុ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        {selectedClass && selectedSubject && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">សិស្សសរុប</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{classStats.total}</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      ជាប់ {classStats.passed}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                      ធ្លាក់ {classStats.failed}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">មុខវិជ្ជា</p>
                  <p className="text-xl font-bold text-gray-900 mt-1 truncate">{subjectName}</p>
                  <p className="text-xs text-gray-500 mt-1">មាន {options.length} ប្រភេទពិន្ទុ</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <BookOpen className="text-amber-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">ខែ</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{date}</p>
                  {lastSavedDate && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      រក្សាទុក: {lastSavedDate}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {fetching ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mb-4 text-blue-500 mx-auto" size={40} />
              <p className="text-gray-600 font-medium">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
          ) : !selectedClass || !selectedSubject ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <AlertCircle className="text-gray-400" size={32} />
              </div>
              <p className="text-lg font-medium text-gray-600">សូមជ្រើសរើសថ្នាក់ និងមុខវិជ្ជា</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="text-gray-400" size={32} />
              </div>
              <p className="text-lg font-medium text-gray-600">រកមិនឃើញសិស្ស</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="p-4 text-center font-semibold text-gray-700 sticky left-0 bg-gray-50 z-20">ល.រ</th>
                      <th className="p-4 text-left font-semibold text-gray-700 min-w-[100px] sticky left-16 bg-gray-50 z-20">ឈ្មោះ</th>
                      <th className="p-4 text-center font-semibold text-gray-700">ភេទ</th>
                      <th className="p-4 text-center font-semibold text-gray-700">ថ្ងៃកំណើត</th>
                      
                      {options.map(o => (
                        <th key={o.value} className="p-3 text-center min-w-[130px] bg-blue-50/50">
                          <div className="font-bold text-blue-800">{o.label}</div>
                          <div className="text-xs text-blue-600 mt-0.5">{(o.weight * 100).toFixed(0)}%</div>
                        </th>
                      ))}
                      
                      <th className="p-4 text-center font-bold text-gray-700 bg-gray-100/50">មធ្យម</th>
                      <th className="p-4 text-center font-bold text-gray-700 bg-gray-100/50">និទ្ទេស</th>
                      <th className="p-4 text-center font-bold text-gray-700 bg-gray-100/50">លទ្ធផល</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((stu, index) => {
                      const sid = String(stu.student_id || stu.id || '');
                      const studentScores = scores[sid] || {};
                      const average = calculateAverage(sid);
                      const grade = getGrade(average);
                      const hasAnyScore = options.some(o => studentScores[o.value]);

                      return (
                        <tr key={sid} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-4 text-center text-gray-500 sticky left-0 bg-white">{index + 1}</td>
                          <td className="p-4 sticky left-16 bg-white">
                            <div className="font-semibold text-gray-800">{stu.last_name} {stu.first_name}</div>
                            <div className="text-xs text-gray-400">ID: {sid}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              stu.gender === 'Female' || stu.gender?.toLowerCase() === 'ស្រី'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {stu.gender === 'Female' || stu.gender?.toLowerCase() === 'ស្រី' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-500 text-xs">
                            {stu.date_of_birth ? new Date(stu.date_of_birth).toLocaleDateString('km') : '—'}
                          </td>

                          {options.map(o => (
                            <td key={o.value} className="p-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="—"
                                value={studentScores[o.value] ?? ''}
                                onChange={(e) => handleChange(sid, o.value, e.target.value)}
                                className={`w-28 text-center text-sm font-medium py-2 rounded-lg transition-all focus:w-20 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                  !studentScores[o.value]
                                    ? 'bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200'
                                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                } ${parseFloat(studentScores[o.value]) < (MAX_SCORE / 2) ? 'text-red-600' : ''}`}
                                maxLength="5"
                              />
                            </td>
                          ))}

                          <td className="p-4 text-center font-bold bg-gray-50/50">
                            <span className={average === '—' ? 'text-gray-300' : parseFloat(average) >= (MAX_SCORE / 2) ? 'text-gray-800' : 'text-red-600'}>
                              {average}
                            </span>
                          </td>

                          <td className="p-4 text-center font-bold bg-gray-50/50">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold ${
                              grade === 'ល្អ' ? 'bg-emerald-100 text-emerald-700' :
                              grade === 'ល្អបង្គួរ' ? 'bg-blue-100 text-blue-700' :
                              grade === 'ល្អមធ្យម' ? 'bg-amber-100 text-amber-700' :
                              grade === 'ខ្សាយប់' ? 'bg-orange-100 text-orange-700' :
                              grade === 'ខ្សាយ' ? 'bg-red-100 text-red-700' :
                              'text-gray-300'
                            }`}>
                              {grade}
                            </span>
                          </td>

                          <td className="p-4 text-center bg-gray-50/50">
                            {average !== '—' ? (
                              parseFloat(average) >= (MAX_SCORE / 2) ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 size={12} /> ជាប់
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                  <AlertCircle size={12} /> ធ្លាក់
                                </span>
                              )
                            ) : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>សរុប: <strong className="text-gray-900">{filteredStudents.length}</strong></span>
                  <span className="text-gray-300">|</span>
                  <span>ជាប់: <strong className="text-emerald-600">{classStats.passed}</strong></span>
                  <span>ធ្លាក់: <strong className="text-red-600">{classStats.failed}</strong></span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetScores}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
                  >
                    <RotateCcw size={18} />
                    កំណត់ឡើងវិញ
                  </button>
                  <button
                    onClick={save}
                    disabled={submitting || !hasUnsavedChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    {submitting ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreTeacherPage;