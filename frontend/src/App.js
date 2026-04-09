import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import LandingPage       from './pages/LandingPage';
import StudentLogin      from './pages/StudentLogin';
import StudentRegister   from './pages/StudentRegister';
import TeacherLogin      from './pages/TeacherLogin';
import TeacherRegister   from './pages/TeacherRegister';
import StudentDashboard  from './pages/StudentDashboard';
import TeacherDashboard  from './pages/TeacherDashboard';

function Guard({ children, role: requiredRole }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                   element={<LandingPage />} />
      <Route path="/student/login"      element={<StudentLogin />} />
      <Route path="/student/register"   element={<StudentRegister />} />
      <Route path="/teacher/login"      element={<TeacherLogin />} />
      <Route path="/teacher/register"   element={<TeacherRegister />} />
      <Route path="/student/dashboard"  element={<Guard role="student"><StudentDashboard /></Guard>} />
      <Route path="/teacher/dashboard"  element={<Guard role="teacher"><TeacherDashboard /></Guard>} />
      <Route path="*"                   element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a2a', color: '#eeeef8', border: '1px solid #252538', fontFamily: 'DM Sans, sans-serif' }
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
