import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from "../../util/request";
import { Users, Book, Calendar, Plus, X, Search, UserPlus, ArrowLeft } from 'lucide-react';

const ClassDetailViewPrincipalPage = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [classDetails, setClassDetails] = useState(null);
    const [allStudentsInSchool, setAllStudentsInSchool] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalSearchTerm, setModalSearchTerm] = useState('');
    const [principalSchoolId, setPrincipalSchoolId] = useState(null);

    const fetchClassDetails = async () => {
        try {
            // In a real app, you might want a more specific endpoint to get students for a class
            // For now, we assume /api/classes/:id gives us what we need or we make multiple calls.
            // Let's assume we need to get students separately.
            const classRes = await request(`/classes/${classId}`, 'GET');
            setClassDetails(classRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch class details.');
            console.error("Error fetching class details:", err);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch class details first to get the school_id
            const classRes = await request(`/classes/${classId}`, 'GET');
            const schoolId = classRes.data?.school_id;
            setClassDetails(classRes.data);

            if (!schoolId) throw new Error("Could not determine the school for this class.");

            const studentsRes = await request(`/students?school_id=${schoolId}`, 'GET');
            setAllStudentsInSchool(studentsRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load initial data.');
            console.error("Error fetching initial data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [classId]);

    const enrolledStudentIds = useMemo(() => {
        return new Set((classDetails?.students || []).map(s => s.id));
    }, [classDetails]);

    const availableStudents = useMemo(() => {
        return allStudentsInSchool.filter(student => !enrolledStudentIds.has(student.id) &&
            (
                `${student.first_name} ${student.last_name}`.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(modalSearchTerm.toLowerCase())
            )
        );
    }, [allStudentsInSchool, enrolledStudentIds, modalSearchTerm]);

    const handleAddStudent = async (studentId) => {
        try {
            await request(`/classes/${classId}/students`, 'POST', { student_id: studentId });
            // Refresh ALL data to update both the enrolled list and the available list in the modal
            await fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add student.');
            console.error("Error adding student:", err);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!classDetails) {
        return <div className="p-8 text-center">Class not found.</div>;
    }

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => navigate('/principal/classes')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft size={18} /> Back to Classes
                    </button>
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">{classDetails.name}</h1>
                            <div className="flex items-center gap-4 text-gray-500 mt-2">
                                <span className="flex items-center gap-2"><Book size={16} /> Academic Year: {classDetails.academic_year}</span>
                                <span className="flex items-center gap-2"><Calendar size={16} /> Students: {classDetails.students?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-3">
                            <Users size={24} /> Enrolled Students
                        </h2>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
                            <UserPlus size={18} /> Add Student
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(classDetails.students && classDetails.students.length > 0) ? classDetails.students.map(student => (
                                    <tr key={student.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.first_name} {student.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-red-600 hover:text-red-800">Remove</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-10 text-center text-gray-500">No students are enrolled in this class yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-semibold">Add Student to {classDetails.name}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search available students..."
                                    value={modalSearchTerm}
                                    onChange={(e) => setModalSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-grow p-6 pt-0">
                            <ul className="divide-y divide-gray-200">
                                {availableStudents.length > 0 ? availableStudents.map(student => (
                                    <li key={student.id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{student.first_name} {student.last_name}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddStudent(student.id)}
                                            className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200"
                                        >
                                            Add
                                        </button>
                                    </li>
                                )) : (
                                    <li className="py-10 text-center text-gray-500">
                                        {modalSearchTerm ? 'No matching students found.' : 'All students in this school are already in the class.'}
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="p-6 border-t bg-gray-50 rounded-b-xl text-right">
                            <button onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassDetailViewPrincipalPage;
