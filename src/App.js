import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate , useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { EquipmentAdminProvider } from './context/EquipmentAdminContext';
import { ProfessorProvider } from './context/ProfessorContext';
import { useAuth } from './hooks/useAuth';
import EmailVerification from './pages/auth/EmailVerification';
import Navbar from './components/layout/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { RoomProvider } from './context/RoomContext'; 
import { RoomBookProvider } from './context/RoomBookingContext'; 
import { AdminRoomBookingProvider } from './context/AdminRoomBookingContext';
import { QRCodeProvider } from './context/QRCodeContext';
import { AdminSeatBookingProvider } from './context/AdminSeatBookingContext';
import { PublicScheduleProvider } from './context/PublicScheduleContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import AnalyticsDashboard from './components/admin/Analytics/AnalyticsDashboard';

// FontAwesome CSS
import '@fortawesome/fontawesome-free/css/all.min.css';

// user management
import { UserManagementProvider } from './context/UserManagementContext';
import UserManagementDashboard from './components/admin/UserManagement/UserManagementDashboard';
import PasswordProtectedRoute from './pages/auth/PasswordProtectedRoute';
import ChangePassword from './pages/auth/ChangePassword';


// Librarian Management Components
import AdminLibrarianManagement from './components/admin/LibrarianManagement/AdminLibrarianManagement';
import LibrarianDashboard from './components/librarian/LibrarianDashboard';
import ActiveLibrariansCard from './pages/user/ActiveLibrariansCard';

// User Seats pages
import UserDashboard from './pages/user/Dashboard';
import SeatsPage from './pages/seats/Seats';
import MyBookingsPage from './pages/user/MyBookings';
import MyWaitlistPage from './pages/user/MyWaitlist';
import LibrarySchedule from './pages/user/LibrarySchedule';

//Masoro Seats
import MasoroSeatsPage from './pages/seats/MasoroSeats';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import SeatManagement from './pages/admin/SeatManagement';
import ScheduleManagement from './pages/admin/ScheduleManagement';
import AdminRoomManagement from './components/admin/RoomManagement/AdminRoomManagement';
import AdminSidebar from './components/common/AdminSidebar';
import SeatBookingManagement from './pages/admin/SeatBookingManagement';

// Equipment & Lab Management Components
import EquipmentManagementDashboard from './components/admin/EquipmentManagement/EnhancedEquipmentDashboard';
import CourseManagement from './components/admin/EquipmentManagement/CourseManagement';
import LabClassManagement from './components/admin/EquipmentManagement/LabClassManagement';
import EquipmentRequestManagement from './components/admin/EquipmentManagement/EquipmentRequestManagement';
import EquipmentUnitsPage from './components/admin/EquipmentManagement/EquipmentUnitsPage';
import AssignmentsPage from './components/admin/EquipmentManagement/AssignmentsPage';
import EquipmentReportsPage from './components/admin/EquipmentManagement/EquipmentReportsPage';

// Lab Request Components
import RequestLabPage from './components/professor/RequestLabPage';
import MyLabRequestsPage from './components/professor/MyLabRequestsPage';
import LabRequestManagement from './components/admin/EquipmentManagement/LabRequestManagement';

// Professor Components
import ProfessorDashboard from './components/professor/ProfessorDashboard';
import RequestEquipmentPage from './components/professor/RequestEquipmentPage';
import MyRequestsPage from './components/professor/MyRequestsPage';
import MyCoursesPage from './components/professor/MyCoursesPage';

// HOD Components
import HODDashboard from './components/hod/HODDashboard';

// User room management
import RoomBrowserPage from './pages/rooms/RoomBrowserPage';
import BookRoomPage from './pages/rooms/BookRoomPage';
import MyRoomBookingsPage from './pages/rooms/MyRoomBookingsPage'; 
import MyRoomBookings from './pages/rooms/MyRoomBookingsPage'; 
import RoomBookingDetailsPage from './pages/rooms/RoomBookingDetailsPage';
import JoinableBookingsPage from './pages/rooms/JoinableBookingsPage';

// QR Code related imports
import AdminSeatManagement from './pages/admin/AdminSeatManagement';
import QRManagementPage from './pages/admin/QRManagementPage'; 
import QRScanner from './components/admin/qr/QRScanner';
import QRScanProcessor from './components/admin/qr/QRScanProcessor';

// Room Booking Management
import AdminRoomBookingManagement from './components/admin/RoomManagement/AdminRoomBookingManagement';

// Import global CSS
import './assets/css/styles.css';
import './assets/css/admin.css';
import './assets/css/schedule.css';
import './assets/css/seat-management.css';
import './assets/css/RoomManagementStyle.css';
import './assets/css/admin-room-booking.css';
import './assets/css/qr-scanner.css'; 
import './assets/css/user-management.css';
import './assets/css/professor.css';
import './assets/css/librarian-components.css'; 


// Protected route component with enhanced role checking
const ProtectedRoute = ({ children, requiredRole, allowedRoles = [] }) => {
  const { isAuthenticated, isAdmin, isEquipmentAdmin, isProfessor, isHOD, isLibrarian, loading } = useAuth();
  const navigate = useNavigate();
  
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
  
  // Check specific role requirements
  if (requiredRole) {
    switch (requiredRole) {
      case 'admin':
        if (!isAdmin()) return <Navigate to="/" replace />;
        break;
      case 'equipment-admin':
        if (!isEquipmentAdmin()) return <Navigate to="/" replace />;
        break;
      case 'professor':
        if (!isProfessor()) return <Navigate to="/" replace />;
        break;
      case 'hod':
        if (!isHOD()) return <Navigate to="/" replace />;
        break;
      case 'librarian':
        if (!isLibrarian()) return <Navigate to="/" replace />;
        break;
    }
  }
  
  // Check allowed roles (for pages accessible by multiple roles)
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some(role => {
      switch (role) {
        case 'admin': return isAdmin();
        case 'equipment-admin': return isEquipmentAdmin();
        case 'professor': return isProfessor();
        case 'hod': return isHOD();
        case 'librarian': return isLibrarian();
        default: return false;
      }
    });
    
    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

// QR Scanner Page Component
const QRScannerPage = () => {
  return (
    <QRCodeProvider>
      <div className="qr-scanner-page">
        <QRScanner />
      </div>
    </QRCodeProvider>
  );
};

// Admin redirect component with enhanced role checking
const AdminRedirect = () => {
  const { isAdmin, isEquipmentAdmin, isProfessor, isHOD, isLibrarian } = useAuth();
  
  if (isHOD()) return <Navigate to="/hod/dashboard" replace />;
  if (isEquipmentAdmin()) return <Navigate to="/equipment-admin/dashboard" replace />;
  if (isProfessor()) return <Navigate to="/professor/dashboard" replace />;
  if (isAdmin()) return <Navigate to="/admin" replace />;
  if (isLibrarian()) return <Navigate to="/librarian/dashboard" replace />;
  
  return <UserDashboard />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<EmailVerification />} />

      {/* QR Scanner routes */}
      <Route path="/scan" element={
        <QRCodeProvider>
          <QRScanProcessor />
        </QRCodeProvider>
      } />
      
      <Route path="/qr-scanner" element={<QRScannerPage />} />

      <Route path="/change-password" element={<ChangePassword />} />

      {/* Home route with role-based redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/Schedule"
        element={
          <ProtectedRoute>
            <LibrarySchedule />
          </ProtectedRoute>
        }
      />

      {/* ========== USER MANAGEMENT ROUTES ========== */}
      <Route
       path="/admin/users"
        element={
         <ProtectedRoute requiredRole="admin">
          <UserManagementProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="users" />
          <UserManagementDashboard />
        </div>
      </UserManagementProvider>
    </ProtectedRoute>
  }
/>

      {/* ========== LIBRARIAN MANAGEMENT ROUTES ========== */}
      <Route
        path="/admin/librarians"
        element={
          <ProtectedRoute requiredRole="admin">
            <div className="admin-page-container">
              <AdminSidebar activePage="librarians" />
              <AdminLibrarianManagement />
            </div>
          </ProtectedRoute>
        }
      />

      {/* ========== LIBRARIAN DASHBOARD ROUTES ========== */}
      <Route
        path="/librarian/dashboard"
        element={
          <ProtectedRoute requiredRole="librarian">
            <div className="admin-page-container">
              <AdminSidebar activePage="dashboard" />
              <LibrarianDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      {/* ========== STUDENT/USER ROUTES ========== */}
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
        path="/my-bookings"
        element={
          <ProtectedRoute includeQR={true}>
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
      {/*Masoro seats Routing*/}
      <Route
        path="/Masoro-Seats"
        element={
          <ProtectedRoute>
            <MasoroSeatsPage />
          </ProtectedRoute>
        }
      />
      

      {/* ========== ROOM BOOKING ROUTES ========== */}
      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <RoomBookProvider>
              <RoomBrowserPage />
            </RoomBookProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/book-room/:roomId"
        element={
          <ProtectedRoute>
            <RoomBookProvider>
              <BookRoomPage />
            </RoomBookProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/room-bookings"
        element={
          <ProtectedRoute>
            <RoomBookProvider>
              <MyRoomBookingsPage />
            </RoomBookProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
       path="/my-room-bookings" 
       element={
        <ProtectedRoute>
          <RoomBookProvider>
            <QRCodeProvider>
              <MyRoomBookings />
            </QRCodeProvider>
          </RoomBookProvider>
        </ProtectedRoute>
      }
      />
      
      <Route
        path="/room-booking/:bookingId"
        element={
          <ProtectedRoute>
            <RoomBookProvider>
              <RoomBookingDetailsPage />
            </RoomBookProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/join-bookings"
        element={
          <ProtectedRoute>
            <RoomBookProvider>
              <JoinableBookingsPage />
            </RoomBookProvider>
          </ProtectedRoute>
        }
      />
      
      {/* ========== ADMIN ROUTES ========== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSidebar activePage="User Management" />
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/seats"
        element={
          <ProtectedRoute allowedRoles={["admin", "librarian"]}>
            <SeatManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/seat-management"
        element={
          <ProtectedRoute allowedRoles={["admin", "librarian"]}>
            <AdminSeatManagement />
          </ProtectedRoute>
        }
      />

      <Route
         path="/admin/seat-bookings"
         element={
            <ProtectedRoute allowedRoles={["admin", "librarian"]}>
              <AdminSeatBookingProvider>
              <SeatBookingManagement />
              </AdminSeatBookingProvider>
           </ProtectedRoute>
       }
      />
      
      <Route
        path="/admin/schedule"
        element={
          <ProtectedRoute allowedRoles={["admin", "librarian"]}>
            <ScheduleManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/qr"
        element={
          <ProtectedRoute allowedRoles={["admin", "librarian"]}>
            <QRManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute allowedRoles={["admin", "librarian"]}>
            <AdminRoomManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/Roombookings"
        element={
          <ProtectedRoute allowedRoles={["admin", "librarian"]}>
            <AdminRoomBookingProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="bookings" />
                <AdminRoomBookingManagement />
              </div>
            </AdminRoomBookingProvider>
          </ProtectedRoute>
        }
      />

      {/* ========== EQUIPMENT ADMIN ROUTES ========== */}
      <Route
        path="/admin/equipment-management"
        element={
          <ProtectedRoute allowedRoles={['admin', 'equipment-admin']}>
            <EquipmentAdminProvider>
               <AdminSidebar activePage="equipment-management" />
              <EquipmentManagementDashboard />
            </EquipmentAdminProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute requiredRole="equipment-admin">
            <EquipmentAdminProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="courses" />
                <CourseManagement />
              </div>
            </EquipmentAdminProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/lab-classes"
        element={
          <ProtectedRoute requiredRole="equipment-admin">
            <EquipmentAdminProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="lab-classes" />
                <LabClassManagement />
              </div>
            </EquipmentAdminProvider>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/equipment-requests"
        element={
          <ProtectedRoute requiredRole="equipment-admin">
            <EquipmentAdminProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="equipment-requests" />
                <EquipmentRequestManagement />
              </div>
            </EquipmentAdminProvider>
          </ProtectedRoute>
        }
      />

      <Route
  path="/admin/lab-requests"
  element={
    <ProtectedRoute requiredRole="equipment-admin">
      <EquipmentAdminProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="lab-requests" />
          <LabRequestManagement />
        </div>
      </EquipmentAdminProvider>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/equipment-units"
  element={
    <ProtectedRoute allowedRoles={['admin', 'equipment-admin']}>
      <EquipmentAdminProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="equipment-units" />
          <EquipmentUnitsPage />
        </div>
      </EquipmentAdminProvider>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/equipment-assignments"
  element={
    <ProtectedRoute allowedRoles={['admin', 'equipment-admin']}>
      <EquipmentAdminProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="equipment-assignments" />
          <AssignmentsPage />
        </div>
      </EquipmentAdminProvider>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/equipment-reports"
  element={
    <ProtectedRoute allowedRoles={['admin', 'equipment-admin']}>
      <EquipmentAdminProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="equipment-reports" />
          <EquipmentReportsPage />
        </div>
      </EquipmentAdminProvider>
    </ProtectedRoute>
  }
/>

      {/* ========== PROFESSOR ROUTES ========== */}
       <Route
        path="/professor/dashboard"
        element={
          <ProtectedRoute requiredRole="professor">
            <ProfessorProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="dashboard" />
                <ProfessorDashboard />
              </div>
            </ProfessorProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/request-equipment"
        element={
          <ProtectedRoute requiredRole="professor">
            <ProfessorProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="request-equipment" />
                <RequestEquipmentPage />
              </div>
            </ProfessorProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/my-requests"
        element={
          <ProtectedRoute requiredRole="professor">
            <ProfessorProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="my-requests" />
                <MyRequestsPage />
              </div>
            </ProfessorProvider>
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/my-courses"
        element={
          <ProtectedRoute requiredRole="professor">
            <ProfessorProvider>
              <div className="admin-page-container">
                <AdminSidebar activePage="my-courses" />
                <MyCoursesPage />
              </div>
            </ProfessorProvider>
          </ProtectedRoute>
        }
      />

      <Route
  path="/professor/request-lab"
  element={
    <ProtectedRoute requiredRole="professor">
      <ProfessorProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="request-lab" />
          <RequestLabPage />
        </div>
      </ProfessorProvider>
    </ProtectedRoute>
  }
/>

<Route
  path="/professor/my-lab-requests"
  element={
    <ProtectedRoute requiredRole="professor">
      <ProfessorProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="my-lab-requests" />
          <MyLabRequestsPage />
        </div>
      </ProfessorProvider>
    </ProtectedRoute>
  }
/>
      {/* ========== HOD ROUTES ========== */}
      <Route
        path="/hod/dashboard"
        element={
          <ProtectedRoute requiredRole="hod">
            <div className="admin-page-container">
              <AdminSidebar activePage="dashboard" />
              <HODDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/professor-approvals"
        element={
          <ProtectedRoute requiredRole="hod">
            <div className="admin-page-container">
              <AdminSidebar activePage="professor-approvals" />
              <HODDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/escalated-requests"
        element={
          <ProtectedRoute requiredRole="hod">
            <div className="admin-page-container">
              <AdminSidebar activePage="escalated-requests" />
              <HODDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
  path="/admin/analytics"
  element={
    <ProtectedRoute allowedRoles={['admin', 'librarian', 'equipment-admin']}>
      <AnalyticsProvider>
        <div className="admin-page-container">
          <AdminSidebar activePage="analytics" />
          <AnalyticsDashboard />
        </div>
      </AnalyticsProvider>
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
          <PublicScheduleProvider>
          <QRCodeProvider>
            <Router>
              <div className="app-container">
                <Navbar />
                <main className="main-content">
                  <AppRoutes />
                </main>
              </div>
            </Router>
          </QRCodeProvider>
          </PublicScheduleProvider>
        </ScheduleProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;