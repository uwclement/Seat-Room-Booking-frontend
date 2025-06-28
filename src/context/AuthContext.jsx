import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiLogin(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid credentials' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      return { success: true, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user?.roles.includes('ROLE_ADMIN');
  };

  // NEW: Enhanced role checking functions
  const isEquipmentAdmin = () => {
    return user?.roles.includes('ROLE_EQUIPMENT_ADMIN');
  };

  const isProfessor = () => {
    return user?.roles.includes('ROLE_PROFESSOR');
  };

  const isHOD = () => {
    return user?.roles.includes('ROLE_HOD');
  };

  const hasRole = (role) => {
    return user?.roles.includes(role);
  };

  const getUserRole = () => {
    if (isHOD()) return 'HOD';
    if (isEquipmentAdmin()) return 'Equipment Admin';
    if (isProfessor()) return 'Professor';
    if (isAdmin()) return 'Admin';
    return 'Student';
  };

  const authContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isEquipmentAdmin,
    isProfessor,
    isHOD,
    hasRole,
    getUserRole
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};