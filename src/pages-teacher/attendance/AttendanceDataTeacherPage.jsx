import React, { useState, useEffect, useMemo } from 'react';
import { request } from "../../util/request";
import { 
  Calendar, Loader2, Search, BarChart3, Download, 
  Minus 
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

const AttendanceDataTeacherPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await request('/classes/teacher/me', 'GET');
        const classList = res.data || res || [];
        setClasses(classList);
        if (classList.length > 0) setSelectedClass(classList[0].id);
      } catch (error) {
        console.error(error);
        toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យថ្នាក់");
      }
    };
    fetchClasses();
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    if (!selectedClass) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const studentsRes = await request(`/students?class_id=${selectedClass}`, 'GET');
        let studentList = [];
        if (studentsRes.data && Array.isArray(studentsRes.data)) studentList = studentsRes.data;
        else if (studentsRes.data && studentsRes.data.data && Array.isArray(studentsRes.data.data)) studentList = studentsRes.data.data;
        else if (Array.isArray(studentsRes)) studentList = studentsRes;
        
        // Sort students alphabetically
        studentList.sort((a, b) => (a.last_name || '').localeCompare(b.last_name || ''));
        setStudents(studentList);

        const attendanceRes = await request(`/attendance?class_id=${selectedClass}`, 'GET');
        const records = Array.isArray(attendanceRes) ? attendanceRes : (attendanceRes.data || []);
        setAttendanceData(records);

      } catch (error) {
        console.error(error);
        toast.error("បរាជ័យក្នុងការទាញយកទិន្នន័យវត្តមាន");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass]);

  // 3. Helper: Get days in selected month
  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0); // Last day of month
    const days = date.getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [selectedMonth]);

  // 4. Process Data for the Grid
  const processedData = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-');

    // Filter filteredStudents based on search
    const filteredStudents = students.filter(s => 
      (s.last_name + " " + s.first_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.student_code && s.student_code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return filteredStudents.map(student => {
      const sId = String(student.student_id || student.id);
      
      const dailyStatus = {};
      const stats = { present: 0, absent: 0, permission: 0, late: 0 };

      attendanceData.forEach(record => {
        let recordDate = record.date;
        if (recordDate instanceof Date) {
          recordDate = recordDate.toISOString();
        }
        const [recYear, recMonth, recDay] = String(recordDate).split('T')[0].split('-');
        
        if (String(record.student_id) === sId && recYear === year && recMonth === month) {
          const dayNum = parseInt(recDay);
          dailyStatus[dayNum] = record.status;
          
          if (stats[record.status] !== undefined) {
            stats[record.status]++;
          }
        }
      });

      return {
        ...student,
        dailyStatus,
        stats
      };
    });
  }, [attendanceData, students, selectedMonth, searchQuery, daysInMonth]);

  // 5. Render Status Cell for Web
  const renderStatusCell = (status) => {
    switch (status) {
      case 'present': 
        return <span className="text-indigo-700 font-bold">I</span>;
      case 'absent': 
        return <span className="text-red-600 font-bold">A</span>;
      case 'permission': 
        return <span className="text-blue-600 font-bold">P</span>;
      case 'late': 
        return <span className="text-yellow-600 font-bold">L</span>;
      default: 
        return <Minus size={12} className="text-gray-200 mx-auto" />;
    }
  };

  // --- UPDATED PDF DOWNLOAD FUNCTION ---
  const handleDownloadPDF = () => {
    // 1. Initialize PDF in Landscape ('l') to fit 31 columns
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // 2. Add Title & Legend
    doc.setFontSize(14);
    doc.setTextColor(40);
    const className = classes.find(c => c.id == selectedClass)?.name || 'Unknown Class';
    doc.text(`Monthly Attendance Report: ${className}`, 14, 15);

    doc.setFontSize(10);
    doc.text(`Month: ${selectedMonth}`, 14, 22);

    // Legend (Explaining the codes)
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Legend: I = Present, L = Late, P = Permission, A = Absent", 200, 22);

    // 3. Prepare Header Row
    // [No, Name, 01, 02...31, I, L, P, A]
    const tableHead = [
      "No",
      "Student Name", 
      ...daysInMonth.map(d => String(d).padStart(2, '0')), // Days 01-31
      "I", "L", "P", "A" // Summary
    ];

    // 4. Prepare Body Rows
    const tableBody = processedData.map((s, index) => {
      // Map daily status to letters
      const dayCells = daysInMonth.map(day => {
        const st = s.dailyStatus[day];
        if (st === 'present') return 'I';
        if (st === 'late') return 'L';
        if (st === 'permission') return 'P';
        if (st === 'absent') return 'A';
        return '';
      });

      return [
        index + 1, // Number
        `${s.last_name} ${s.first_name}`, // Name
        ...dayCells,
        s.stats.present,    // I Total
        s.stats.late,       // L Total
        s.stats.permission, // P Total
        s.stats.absent      // A Total
      ];
    });

    // 5. Generate AutoTable
    autoTable(doc, {
      head: [tableHead],
      body: tableBody,
      startY: 28,
      theme: 'grid', // Adds borders to all cells
      styles: { 
        fontSize: 6, // Small font is crucial for fitting 31 days
        cellPadding: 1, 
        valign: 'middle',
        halign: 'center', // Center align text
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [79, 70, 229], // Indigo Color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: { 
        0: { cellWidth: 10 }, // No column
        1: { cellWidth: 35, halign: 'left' } // Name column (wider & left aligned)
        // Days will auto-calculate to fit remaining space
      },
      // Optional: Color code the PDF cells
      didParseCell: (data) => {
        if (data.section === 'body') {
           if (data.cell.raw === 'A') data.cell.styles.textColor = [220, 38, 38]; // Red
           if (data.cell.raw === 'I') data.cell.styles.textColor = [67, 56, 202]; // Indigo
           if (data.cell.raw === 'P') data.cell.styles.textColor = [37, 99, 235]; // Blue
           if (data.cell.raw === 'L') data.cell.styles.textColor = [202, 138, 4]; // Yellow
        }
      }
    });

    doc.save(`attendance_${className}_${selectedMonth}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6 font-kantumruy">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" />
              របាយការណ៍វត្តមានប្រចាំខែ
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 font-medium cursor-pointer"
            />

            <button 
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Download size={18} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-sm bg-white p-4 rounded-xl border border-gray-100 shadow-sm font-medium">
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-indigo-50 text-indigo-700 font-bold">I</span> <span>វត្តមាន (Present)</span></div>
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-yellow-50 text-yellow-600 font-bold">L</span> <span>យឺត (Late)</span></div>
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-blue-50 text-blue-600 font-bold">P</span> <span>ច្បាប់ (Permission)</span></div>
        <div className="flex items-center gap-2"><span className="w-6 h-6 rounded flex items-center justify-center bg-red-50 text-red-600 font-bold">A</span> <span>អវត្តមាន (Absent)</span></div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-320px)]">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="font-bold text-gray-700">ខែ: {selectedMonth}</div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ស្វែងរកឈ្មោះ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            />
          </div>
        </div>

        {/* Scrollable Table Area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="bg-gray-50 text-gray-600 text-xs border-b border-gray-200">
                  <th className="py-3 px-2 font-semibold sticky left-0 bg-gray-50 z-20 w-12 border-r border-gray-200">ID</th>
                  <th className="py-3 px-4 font-semibold sticky left-12 bg-gray-50 z-20 w-48 border-r border-gray-200">ឈ្មោះសិស្ស</th>
                  
                  {/* Date Columns */}
                  {daysInMonth.map(day => (
                    <th key={day} className="py-3 px-1 text-center font-medium w-8 border-r border-gray-100 min-w-[35px]">
                      {String(day).padStart(2, '0')}
                    </th>
                  ))}

                  {/* Summary Columns */}
                  <th className="py-3 px-2 text-center font-bold text-indigo-700 border-l border-gray-200 w-10 bg-indigo-50/30">I</th>
                  <th className="py-3 px-2 text-center font-bold text-yellow-600 w-10 bg-yellow-50/30">L</th>
                  <th className="py-3 px-2 text-center font-bold text-blue-600 w-10 bg-blue-50/30">P</th>
                  <th className="py-3 px-2 text-center font-bold text-red-600 w-10 bg-red-50/30">A</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {processedData.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-2 text-gray-500 font-mono text-xs sticky left-0 bg-white z-10 border-r border-gray-100">
                      {student.student_code || student.student_id || `#${student.id}`}
                    </td>
                    <td className="py-2 px-4 font-medium text-gray-800 sticky left-12 bg-white z-10 border-r border-gray-100 whitespace-nowrap">
                      {student.last_name} {student.first_name}
                    </td>

                    {/* Daily Cells */}
                    {daysInMonth.map(day => (
                      <td key={day} className="py-2 px-1 text-center border-r border-gray-50 text-xs">
                        {renderStatusCell(student.dailyStatus[day])}
                      </td>
                    ))}

                    {/* Summary Data */}
                    <td className="py-2 px-2 text-center font-bold text-indigo-700 bg-indigo-50/10 border-l border-gray-200">{student.stats.present}</td>
                    <td className="py-2 px-2 text-center font-bold text-yellow-600 bg-yellow-50/10">{student.stats.late}</td>
                    <td className="py-2 px-2 text-center font-bold text-blue-600 bg-blue-50/10">{student.stats.permission}</td>
                    <td className="py-2 px-2 text-center font-bold text-red-600 bg-red-50/10">{student.stats.absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceDataTeacherPage;