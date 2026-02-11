import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Pencil, Trash2, Search, X, Save, Loader2, GraduationCap } from 'lucide-react';
import { request } from '../../util/request';
import toast from 'react-hot-toast';
import { useAuth } from '../../component/layout/AuthContext';

const SubjectPagePrincipal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState({ id: '', name: '', description: '' });
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch Subjects
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      
      const res = await request('/subjects/school/me', 'GET');

      let data = [];
      if (res.data && Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else if (Array.isArray(res)) {
        data = res;
      } else if (res.data && res.data.data && res.data.data.data && Array.isArray(res.data.data.data)) {
        data = res.data.data.data;
      }
      setSubjects(data);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកមុខវិជ្ជា");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("តើអ្នកប្រាកដទេថាចង់លុបមុខវិជ្ជានេះ?")) return;
    
    try {
      await request(`/subjects/${id}`, 'DELETE');
      toast.success("លុបមុខវិជ្ជាជោគជ័យ");
      fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការលុបមុខវិជ្ជា");
    }
  };

  // Update
  const openEditModal = (subject) => {
    setEditingSubject({ 
      id: subject.id, 
      name: subject.name, 
      description: subject.description || '' 
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingSubject.name.trim()) return toast.error("ឈ្មោះមុខវិជ្ជាត្រូវបានទាមទារ");
    
    try {
      setUpdateLoading(true);
      await request(`/subjects/${editingSubject.id}`, 'PUT', {
        name: editingSubject.name,
        description: editingSubject.description
      });
      toast.success("កែប្រែមុខវិជ្ជាជោគជ័យ");
      setIsEditModalOpen(false);
      fetchSubjects();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "បរាជ័យក្នុងការកែប្រែមុខវិជ្ជា");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Filter
  const filteredSubjects = subjects.filter(sub => 
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-kantumruy">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
               <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">គ្រប់គ្រងមុខវិជ្ជា</h1>
              <p className="text-gray-500 mt-1">មើលនិងកែប្រែមុខវិជ្ជាសិក្សាទាំងអស់</p>
            </div>
          </div>
          
          <button 
             onClick={() => navigate('/principal/subjects/create')}
             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg shadow-indigo-200"
          >
             <Plus size={20} />
             <span>បង្កើតមុខវិជ្ជាថ្មី</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
           <div className="p-4 border-b border-gray-100">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ស្វែងរកមុខវិជ្ជា..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 focus:bg-white"
                />
              </div>
           </div>

           {/* Subjects List */}
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50/50 border-b border-gray-100">
                 <tr>
                   <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider w-16">ល.រ</th>
                   <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">ឈ្មោះមុខវិជ្ជា</th>
                   <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">ការពិពណ៌នា</th>
                   <th className="px-6 py-4 text-right text-sm font-bold text-gray-500 uppercase tracking-wider w-32">សកម្មភាព</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 bg-white">
                 {filteredSubjects.length === 0 ? (
                   <tr>
                     <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                           <div className="p-3 bg-gray-100 rounded-full">
                              <BookOpen className="text-gray-400" size={24} />
                           </div>
                           <p className="font-medium">រកមិនឃើញមុខវិជ្ជា</p>
                           <p className="text-sm">ព្យាយាមស្វែងរកម្តងទៀត ឬបង្កើតថ្មី</p>
                        </div>
                     </td>
                   </tr>
                 ) : (
                   filteredSubjects.map((subject, index) => (
                     <tr key={subject.id} className="hover:bg-indigo-50/30 transition-colors group">
                       <td className="px-6 py-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <BookOpen size={18} />
                             </div>
                             <span className="font-bold text-gray-900">{subject.name}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {subject.description || <span className="text-gray-400 italic">គ្មានការពិពណ៌នា</span>}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={() => openEditModal(subject)}
                               className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                               title="កែប្រែ"
                             >
                                <Pencil size={18} />
                             </button>
                             <button
                               onClick={() => handleDelete(subject.id)}
                               className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                               title="លុប"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">កែប្រែមុខវិជ្ជា</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  ឈ្មោះមុខវិជ្ជា <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder-gray-400 font-medium"
                  placeholder="ឧទាហរណ៍៖ គណិតវិទ្យា"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  ការពិពណ៌នា
                </label>
                <textarea
                  value={editingSubject.description}
                  onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder-gray-400"
                  placeholder="ពិពណ៌នាសង្ខេប..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl font-bold transition-colors border border-transparent hover:border-gray-200"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg shadow-indigo-200"
                >
                  {updateLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      កំពុងរក្សាទុក...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      រក្សាទុក
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPagePrincipal;