import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Public pages
import Landing       from './pages/public/Landing';
import About         from './pages/public/About';
import Login         from './pages/public/Login';
import Register      from './pages/public/Register';
import ForgotPassword   from './pages/public/ForgotPassword';
import ResetPassword    from './pages/public/ResetPassword';
import VerifyEmail      from './pages/public/VerifyEmail';

// User pages
import UserDashboard      from './pages/user/UserDashboard';
import BookRide           from './pages/user/BookRide';
import RideHistory        from './pages/user/RideHistory';
import Profile            from './pages/user/Profile';
import FavoriteLocations  from './pages/user/FavoriteLocations';

// Driver pages
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveRide      from './pages/driver/ActiveRide';
import DriverEarnings  from './pages/driver/DriverEarnings';
import DriverProfile   from './pages/driver/DriverProfile';
import RideRequests    from './pages/driver/RideRequests';

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import UserManagement   from './pages/admin/UserManagement';
import DriverManagement from './pages/admin/DriverManagement';
import RideManagement   from './pages/admin/RideManagement';
import Revenue          from './pages/admin/Revenue';
import Complaints       from './pages/admin/Complaints';
import DemandAnalytics  from './pages/admin/DemandAnalytics';

// Route guards
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="spinner w-10 h-10" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const redirects = { admin: '/admin', driver: '/driver', user: '/dashboard' };
    return <Navigate to={redirects[user.role] || '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Landing />} />
        <Route path="/about"    element={<About />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password"          element={<ForgotPassword />} />
        <Route path="/reset-password/:token"     element={<ResetPassword />} />
        <Route path="/verify-email/:token"        element={<VerifyEmail />} />

        {/* User routes */}
        <Route path="/dashboard"        element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />
        <Route path="/book"             element={<PrivateRoute roles={['user']}><BookRide /></PrivateRoute>} />
        <Route path="/rides"            element={<PrivateRoute roles={['user']}><RideHistory /></PrivateRoute>} />
        <Route path="/profile"          element={<PrivateRoute roles={['user']}><Profile /></PrivateRoute>} />
        <Route path="/favorites"        element={<PrivateRoute roles={['user']}><FavoriteLocations /></PrivateRoute>} />

        {/* Driver routes */}
        <Route path="/driver"           element={<PrivateRoute roles={['driver']}><DriverDashboard /></PrivateRoute>} />
        <Route path="/driver/ride"      element={<PrivateRoute roles={['driver']}><ActiveRide /></PrivateRoute>} />
        <Route path="/driver/earnings"  element={<PrivateRoute roles={['driver']}><DriverEarnings /></PrivateRoute>} />
        <Route path="/driver/profile"   element={<PrivateRoute roles={['driver']}><DriverProfile /></PrivateRoute>} />
        <Route path="/driver/requests"  element={<PrivateRoute roles={['driver']}><RideRequests /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin"              element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users"        element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
        <Route path="/admin/drivers"      element={<PrivateRoute roles={['admin']}><DriverManagement /></PrivateRoute>} />
        <Route path="/admin/rides"        element={<PrivateRoute roles={['admin']}><RideManagement /></PrivateRoute>} />
        <Route path="/admin/revenue"      element={<PrivateRoute roles={['admin']}><Revenue /></PrivateRoute>} />
        <Route path="/admin/complaints"   element={<PrivateRoute roles={['admin']}><Complaints /></PrivateRoute>} />
        <Route path="/admin/demand"       element={<PrivateRoute roles={['admin']}><DemandAnalytics /></PrivateRoute>} />

        {/* Fallbacks */}
        <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center text-white bg-dark-bg"><h1 className="text-2xl">403 — Access Denied</h1></div>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: '#161829', color: '#f1f5f9', border: '1px solid #1e2038', borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#161829' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#161829' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
