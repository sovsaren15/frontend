import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  Loader2,
  MapPin,
  Clock,
  Image as ImageIcon,
  Filter,
  Eye,
  ArrowLeft,
  LayoutList, 
  LayoutGrid
} from "lucide-react";
import { request } from "../../util/request";
import toast from "react-hot-toast";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const normalizedPath = imagePath.replace(/\\/g, "/");
  const relativePath = normalizedPath.includes("uploads/")
    ? normalizedPath.substring(normalizedPath.indexOf("uploads/"))
    : normalizedPath;
  return `http://localhost:8081/${relativePath}`;
};

const EventTeacherPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); 

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await request("/events", "GET");
      setEvents(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("បរាជ័យក្នុងការទាញយកព្រឹត្តិការណ៍");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen p-6 font-kantumruy bg-gray-50/50">
      <div className=" mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </span>
              គ្រប់គ្រងព្រឹត្តិការណ៍
            </h1>
            <p className="text-gray-500 mt-1 ml-11">
              រៀបចំនិងកំណត់កាលវិភាគសកម្មភាពសាលា
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft size={20} />
              <span>ត្រឡប់ក្រោយ</span>
            </button>
          </div>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <div className="relative flex-1 group ">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង ឬការពិពណ៌នា..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex gap-2">
             <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-sm">
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   <LayoutList size={20} />
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   <LayoutGrid size={20} />
                </button>
             </div>
          </div>
        </div>

        {/* Events Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-gray-500">កំពុងផ្ទុកព្រឹត្តិការណ៍...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <Calendar className="text-gray-300 w-12 h-12" />
            </div>
            <p className="text-gray-900 font-semibold text-lg">រកមិនឃើញព្រឹត្តិការណ៍</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredEvents.map((event) => {
              let img = event.image;
              try {
                const parsed = JSON.parse(event.image);
                if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
              } catch (e) {}

              return (
                <div 
                  key={event.id} 
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col h-full'
                  }`}
                >
                  {/* Image Section */}
                  <div className={`relative overflow-hidden bg-gray-100 shrink-0 ${
                    viewMode === 'list' ? 'w-full sm:w-64 h-48 sm:h-auto' : 'h-48 w-full'
                  }`}>
                    {img ? (
                      <img
                        src={getImageUrl(img)}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={40} />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex-1">
                       <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                         {event.title}
                       </h3>
                       
                       {/* Date Range Display */}
                       <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                             <span className="text-gray-500 font-medium">ចាប់ផ្តើម:</span>
                             <span className="text-indigo-600 font-bold">
                                {new Date(event.start_date).toLocaleDateString("km-KH")}
                             </span>
                          </div>
                          <div className="hidden sm:block text-gray-300">|</div>
                          <div className="flex items-center gap-2">
                             <span className="text-gray-500 font-medium">បញ្ចប់:</span>
                             <span className="text-red-500 font-bold">
                                {new Date(event.end_date).toLocaleDateString("km-KH")}
                             </span>
                          </div>
                       </div>

                       <p className={`text-gray-500 text-sm ${viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-2'} mb-4`}>
                         {event.description || "មិនមានការពិពណ៌នា"}
                       </p>

                       <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                         <div className="flex items-center gap-2 text-sm text-gray-600">
                           <Clock size={16} className="text-indigo-500" />
                           <span>
                             {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                         {event.location && (
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                             <MapPin size={16} className="text-red-500" />
                             <span className="truncate max-w-[200px]">{event.location}</span>
                           </div>
                         )}
                       </div>
                    </div>

                    <div className={`mt-auto ${viewMode === 'list' ? 'sm:self-start' : 'w-full'}`}>
                      <button
                        onClick={() => navigate(`/teacher/events/viewdetail/${event.id}`)}
                        className={`py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 ${
                            viewMode === 'list' ? 'px-6 w-full sm:w-auto' : 'w-full'
                        }`}
                      >
                        <Eye size={18} />
                        មើលលម្អិត
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTeacherPage;