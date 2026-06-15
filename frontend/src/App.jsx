import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Admin Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Members from './pages/Members';
import Payments from './pages/Payments';
import Settings from './pages/Settings';

// User Pages
import UserLogin from './pages/UserLogin';
import UserDashboard from './pages/UserDashboard';

// Route Guards
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  if (!token) return <Navigate to="/user-login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      {/* Premium Toast Configuration */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            color: '#18181B', // zinc-900
            border: '1px solid rgba(228, 228, 231, 0.5)', // zinc-200
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            borderRadius: '1rem',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10B981', // emerald-500
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#F43F5E', // rose-500
              secondary: '#fff',
            },
          },
        }} 
      />
      
      <Routes>
        {/* Admin Auth Route */}
        <Route path="/login" element={<Login />} />
        
        {/* User Routes */}
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-dashboard" element={
          <UserProtectedRoute>
            <UserDashboard />
          </UserProtectedRoute>
        } />
        
        {/* Admin Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}