import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './pages/DashboardOverview';
import UserManagement from './pages/UserManagement';
import AcademicManagement from './pages/AcademicManagement';
import FinanceOverview from './pages/FinanceOverview';
import BookManagement from './pages/BookManagement';
import StudentProfile from './pages/StudentProfile';
import ExamsResults from './pages/ExamsResults';
import StaffManagement from './pages/StaffManagement';
import SystemSettings from './pages/SystemSettings';
import LeaveManagement from './pages/LeaveManagement';
import PayrollManagement from './pages/PayrollManagement';
import DocumentManagement from './pages/DocumentManagement';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-gray">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const ComingSoon = () => (
  <div className="card p-12 text-center">
    <h2 className="text-2xl font-black text-slate-900 mb-2">Coming Soon</h2>
    <p className="text-slate-500">This module is currently under development.</p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/:role" element={<LoginPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardOverview />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/users" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout>
            <UserManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/students/:id" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout>
            <StudentProfile />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/academics" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout>
            <AcademicManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/finance" element={
        <ProtectedRoute roles={['admin', 'accountant']}>
          <DashboardLayout>
            <FinanceOverview />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/books" element={
        <ProtectedRoute roles={['admin', 'librarian']}>
          <DashboardLayout>
            <BookManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/staff" element={
        <ProtectedRoute roles={['admin', 'hr']}>
          <DashboardLayout>
            <StaffManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/payroll" element={
        <ProtectedRoute roles={['admin', 'hr', 'accountant']}>
          <DashboardLayout>
            <PayrollManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/leave" element={
        <ProtectedRoute roles={['admin', 'hr']}>
          <DashboardLayout>
            <LeaveManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/documents" element={
        <ProtectedRoute roles={['admin', 'hr']}>
          <DashboardLayout>
            <DocumentManagement />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/exams" element={
        <ProtectedRoute roles={['admin', 'student', 'parent']}>
          <DashboardLayout>
            <ExamsResults />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/settings" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout>
            <SystemSettings />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Fallback for other dashboard routes */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ComingSoon />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
