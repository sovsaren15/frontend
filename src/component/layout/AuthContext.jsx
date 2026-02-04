import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../util/request';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // To check token validity on initial load
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          // The interceptor in request.js will handle the token
          const { user } = await request('/auth/validate-token');
          setUser(user);
        } catch (error) {
          console.error("Token validation failed", error);
          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (credentials) => {
    const { token: userToken, user: userData } = await request('/auth/login', 'POST', credentials);

    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);

    // Redirect based on user role
    if (userData.role_name === "Admin") {
      navigate("/admin/dashboard");
    } else if (userData.role_name === "Principal") {
      navigate("/principal/dashboard");
    } else {
      navigate("/teacher/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};