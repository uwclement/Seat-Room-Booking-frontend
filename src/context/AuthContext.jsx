
import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await apiLogin(identifier, password);
      
      // Store token and user data
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
    return !!user && !!localStorage.getItem('token');
  };

  const isAdmin = () => {
    return user?.roles?.includes('ROLE_ADMIN');
  };

  const isEquipmentAdmin = () => {
    return user?.roles?.includes('ROLE_EQUIPMENT_ADMIN');
  };

  const isProfessor = () => {
    return user?.roles?.includes('ROLE_PROFESSOR');
  };

  const isHOD = () => {
    return user?.roles?.includes('ROLE_HOD');
  };

  const isLibrarian = () => {
    return user?.roles?.includes('ROLE_LIBRARIAN');
  };


  const isStudent = () => {
    return user?.roles?.includes('ROLE_USER') || user?.userType === 'STUDENT';
  };

  const isStaff = () => {
    return user?.userType === 'STAFF';
  };

  const getUserLocation = () => {
    return user?.location;
  };

  // Check if user is at a specific location
  const isAtLocation = (location) => {
    return user?.location === location;
  };

  // Get user's identifier (studentId or employeeId)
  const getUserIdentifier = () => {
    return user?.identifier || user?.studentId || user?.employeeId;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  // Get primary user role for display
  const getUserRole = () => {
    if (!user?.roles) return 'Student';
    
    if (isHOD()) return 'Head of Department';
    if (isEquipmentAdmin()) return 'Equipment Admin';
    if (isProfessor()) return 'Professor';
    if (isAdmin()) return 'Administrator';
    if (isLibrarian()) {
      const location = getUserLocation();
      return `Librarian${location ? ` (${location})` : ''}`;
    }
    return 'Student';
  };

  //Check if user account is fully activated
  const isAccountActive = () => {
    return user?.emailVerified && !user?.mustChangePassword;
  };

  // Check if user needs to change password
  const mustChangePassword = () => {
    return user?.mustChangePassword;
  };

  // Check if email is verified
  const isEmailVerified = () => {
    return user?.emailVerified;
  };

  // Get user permissions based on roles and location
  const getUserPermissions = () => {
    const permissions = [];
    
    if (isAdmin()) {
      permissions.push('FULL_ADMIN_ACCESS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG');
    }
    
    if (isLibrarian()) {
      permissions.push('FULL_ADMIN_ACCESS','LIBRARY_MANAGEMENT', 'BOOK_MANAGEMENT');
      const location = getUserLocation();
      if (location) {
        permissions.push(`LIBRARY_${location}_ACCESS`);
      }
    }
    
    if (isProfessor()) {
      permissions.push('EQUIPMENT_REQUEST', 'ACADEMIC_RESOURCES');
    }
    
    if (isEquipmentAdmin()) {
      permissions.push('EQUIPMENT_MANAGEMENT', 'LAB_MANAGEMENT');
    }
    
    if (isHOD()) {
      permissions.push('PROFESSOR_APPROVAL', 'DEPARTMENT_MANAGEMENT');
    }
    
    if (isStudent()) {
      permissions.push('SEAT_BOOKING', 'RESOURCE_ACCESS');
    }
    
    return permissions;
  };

  const authContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    
    // Authentication checks
    isAuthenticated,
    
    // Role checks
    isAdmin,
    isEquipmentAdmin,
    isProfessor,
    isHOD,
    isLibrarian,
    isStudent,
    isStaff,
    hasRole,
    
    // Location functions
    getUserLocation,
    isAtLocation,
    
    // User info functions
    getUserIdentifier,
    getUserRole,
    getUserPermissions,
    
    // Account status checks
    isAccountActive,
    mustChangePassword,
    isEmailVerified
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};