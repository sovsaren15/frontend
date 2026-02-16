import React, { useState } from "react";
import { useAuth } from "../component/layout/AuthContext";
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Youtube, 
  Twitter,
  Loader2 
} from "lucide-react";

const HomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login({
        email,
        password,
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "ការចូលប្រើប្រាស់បរាជ័យ។ សូមព្យាយាមម្តងទៀត។";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-kantumruy bg-gray-50">
      
      {/* Left Side - Image & Info Section */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-indigo-900">
        <img 
          src="https://scontent.fpnh11-2.fna.fbcdn.net/v/t39.30808-6/527584826_122180012198354040_85961526059982970_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=V5z09IPVU0AQ7kNvwGyeDfZ&_nc_oc=AdnGmS3pZefLWFp1bJ1BjtbOgD5Ttn6ShKyE1nECQkGvi4fYlOUXu57B77yJxfZGr9Q&_nc_zt=23&_nc_ht=scontent.fpnh11-2.fna&_nc_gid=ZZ7opJKqdSMcntab69jQyA&oh=00_AftXvaEvJxp2rFY90DeF4Sh5GCG3pUfJOgMufUSr0hCS6A&oe=6997B014" 
          alt="Students in classroom"
          className="w-full h-full object-cover opacity-100 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-blue-900/80 to-indigo-800/90"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
                 <img src="/slogo.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-bold">ក្រសួងអប់រំ យុវជន និងកីឡា</h2>
                <p className="text-xs text-blue-200 tracking-wider">MINISTRY OF EDUCATION, YOUTH AND SPORT</p>
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <h3 className="text-xl font-bold mb-4 border-b border-white/20 pb-2 inline-block">ទំនាក់ទំនង</h3>
                 <div className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors">
                    <Phone size={18} />
                    <span>+855 23 218 045</span>
                 </div>
                 <div className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors">
                    <Mail size={18} />
                    <span>info@moeys.gov.kh</span>
                 </div>
                 <div className="flex items-start gap-3 text-blue-100 hover:text-white transition-colors">
                    <MapPin size={18} className="mt-1 shrink-0" />
                    <span className="leading-relaxed">អគារលេខ ៨០ មហាវិថីព្រះនរោត្តម រាជធានីភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា</span>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <a href="#" className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-all hover:-translate-y-1">
                    <Facebook size={20} />
                 </a>
                 <a href="#" className="p-2 bg-red-600 rounded-full hover:bg-red-500 transition-all hover:-translate-y-1">
                    <Youtube size={20} />
                 </a>
                 <a href="#" className="p-2 bg-sky-500 rounded-full hover:bg-sky-400 transition-all hover:-translate-y-1">
                    <Twitter size={20} />
                 </a>
              </div>
           </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 relative">
         {/* Decorative blob */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-bl-full -z-10"></div>

         <div className="w-full max-w-md">
            <div className="text-center mb-10">
               <img src="/slogo.svg" alt="Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
               <h1 className="text-2xl font-bold text-gray-900 mb-2">សូមស្វាគមន៍</h1>
               <p className="text-gray-500">បញ្ចូលព័ត៌មានដើម្បីចូលប្រើប្រាស់ប្រព័ន្ធ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">អ៊ីមែល</label>
                  <div className="relative group">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                     <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="example@school.edu.kh"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all placeholder:text-gray-300"
                     />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">លេខសម្ងាត់</label>
                  <div className="relative group">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                     <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all placeholder:text-gray-300"
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                     >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                     </button>
                  </div>
               </div>

               {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                     {error}
                  </div>
               )}

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  {loading ? (
                     <>
                        <Loader2 className="animate-spin" size={20} />
                        កំពុងដំណើរការ...
                     </>
                  ) : (
                     "ចូលប្រើប្រាស់"
                  )}
               </button>
            </form>

            <div className="mt-8 text-center text-xs text-gray-400">
               © {new Date().getFullYear()} Ministry of Education, Youth and Sport.
            </div>
         </div>
      </div>
    </div>
  );
};

export default HomePage;