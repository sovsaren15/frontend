import React from "react";
import { useState } from "react";
import { useAuth } from "../component/layout/AuthContext";

const HomePage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // The login function from AuthContext will handle the API call,
      // storing the token, and navigating to the correct dashboard.
      await login({
        email,
        password,
      });
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80" 
          alt="Students in classroom"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
        
        {/* Bottom Left - Ministry Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"></div>
            </div>
            <div className="text-white">
              <p className="text-sm font-semibold">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
              <p className="text-xs opacity-90">MINISTRY OF EDUCATION, YOUTH AND SPORT</p>
            </div>
          </div>
          
          <div className="text-white text-sm space-y-2 opacity-90">
            <p className="font-semibold mb-2">ទំនាក់ទំនង</p>
            <div className="flex items-center gap-2">
              <span className="text-blue-300">📞</span>
              <span>+855 23 218 045</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-300">✉️</span>
              <span>info@moeys.gov.kh / webmaster@moeys.gov.kh</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-300">📍</span>
              <span>Address: 555, Preah Norodom Blvd, Phnom Penh, Cambodia</span>
            </div>
          </div>
          
          {/* Social Media Icons */}
          <div className="flex gap-3 mt-4">
            <div className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center cursor-pointer transition">
              <span className="text-white text-sm font-bold">f</span>
            </div>
            <div className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center cursor-pointer transition">
              <span className="text-white text-xs">▶</span>
            </div>
            <div className="w-8 h-8 bg-blue-400 hover:bg-blue-500 rounded flex items-center justify-center cursor-pointer transition">
              <span className="text-white text-sm font-bold">t</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-xl">
                <div className="w-16 h-16 border-4 border-white rounded-full"></div>
              </div>
            </div>
            <h1 className="text-white text-lg font-semibold mb-1">ក្រសួងអប់រំ យុវជន និងកីឡា</h1>
            <p className="text-blue-200 text-xs">MINISTRY OF EDUCATION, YOUTH AND SPORT</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ចូលប្រើប្រាស់</h2>
            
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">អ៊ីម៉ែលរបស់អ្នក</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user_1234@"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">លេខសម្ងាត់</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              
              <div className="flex justify-end mb-5">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                  ភ្លេចលេខសម្ងាត់?
                </button>
              </div>
              
              {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">{error}</p>}
              
              <button 
                type="submit"
                disabled={loading} 
                className="w-full py-3 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? "កំពុងចូល..." : "ចូល"}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex justify-center gap-8 text-sm">
            <button className="text-blue-200 hover:text-white transition">Privacy & Help</button>
            <button className="text-blue-200 hover:text-white transition">Send feedback</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;