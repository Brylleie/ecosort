import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import Login from './pages/Login';

// Admin pages
import AdminPanel from './pages/AdminPanel';
import AdminPointManagement from './pages/AdminPointManagement';
import AdminRewardManagement from './pages/AdminRewardManagement';
import AdminForumModeration from './pages/AdminForumModeration';

// User pages
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import SubmitWaste from './pages/SubmitWaste';
import Rewards from './pages/Rewards';
import Report from './pages/Report';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';
import Leaderboard from './pages/Leaderboard';


// Auth context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route wrapper
const ProtectedRoute = ({ element, isAdminRoute = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isAdminRoute && !isAdmin) return <Navigate to="/" replace />;

  return element;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* User routes (Protected) */}
<Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
<Route path="/forum" element={<ProtectedRoute element={<Forum />} />} />
<Route path="/submitwaste" element={<ProtectedRoute element={<SubmitWaste />} />} />
<Route path="/rewards" element={<ProtectedRoute element={<Rewards />} />} />
<Route path="/report" element={<ProtectedRoute element={<Report />} />} />
<Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
<Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
<Route path="/leaderboard" element={<ProtectedRoute element={<Leaderboard />} />} />


          {/* Admin routes (Protected + Admin Only) */}
          <Route path="/adminpanel" element={<ProtectedRoute element={<AdminPanel />} isAdminRoute />} />
          <Route path="/adminpointmanagement" element={<ProtectedRoute element={<AdminPointManagement />} isAdminRoute />} />
          <Route path="/adminrewardsmanagement" element={<ProtectedRoute element={<AdminRewardManagement />} isAdminRoute />} />
          <Route path="/adminforummoderation" element={<ProtectedRoute element={<AdminForumModeration />} isAdminRoute />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
