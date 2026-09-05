import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import api from './api';

import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Applications from './pages/Applications';
import SavedOpportunities from './pages/SavedOpportunities';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Landing from './pages/Landing';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { theme } = useThemeStore();
  const { isAuthenticated, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Verify auth on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            updateUser(res.data.user);
          }
        } catch (error: any) {
          // Only treat 401/403 as session expiry; ignore network/timeout/500 errors
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error('Session expired or invalid');
          } else {
            console.warn('Auth check failed (server may be starting up):', error.message);
          }
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [isAuthenticated]);

  if (loading) return null; // or a full-screen spinner

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
        
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="resume" element={<ResumeAnalyzer />} />
          <Route path="opportunities" element={<Dashboard />} />
          <Route path="saved" element={<SavedOpportunities />} />
          <Route path="applications" element={<Applications />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
