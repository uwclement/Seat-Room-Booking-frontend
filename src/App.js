import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { useAuth } from './hooks/useAuth';
import EmailVerification from './pages/auth/EmailVerification';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User pages
import UserDashboard from './pages/user/Dashboard';
import SeatsPage from './pages/seats/Seats';
import MyBookingsPage from './pages/user/MyBookings';
import MyWaitlistPage from './pages/user/MyWaitlist';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import SeatManagement from './pages/admin/SeatManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';

// Import global CSS
import './assets/css/styles.css';
import './assets/css/admin.css';
import './assets/css/schedule.css';
import './assets/css/seat-management.css';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
   if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole === 'admin' && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin redirect component
const AdminRedirect = () => {
  const { isAdmin } = useAuth();
  
  return isAdmin() ? <Navigate to="/admin" replace /> : <UserDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<EmailVerification />} />
      
      {/* Protected routes - User & Admin with automatic redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminRedirect />
          </ProtectedRoute>
        }
      />
      
      {/* Seat related routes */}
      <Route
        path="/seats"
        element={
          <ProtectedRoute>
            <SeatsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/waitlist"
        element={
          <ProtectedRoute>
            <MyWaitlistPage />
          </ProtectedRoute>
        }
      />
      
      {/* Protected routes - Admin only */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/seats"
        element={
          <ProtectedRoute requiredRole="admin">
            <SeatManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/schedule"
        element={
          <ProtectedRoute requiredRole="admin">
            <ScheduleManagement />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ScheduleProvider>
          <Router>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <AppRoutes />
              </main>
            </div>
          </Router>
        </ScheduleProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;