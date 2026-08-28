import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { UserRole } from './types';

// Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Skeleton } from './components/common/Skeleton';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';

// Student Pages
import { StudentDashboard } from './features/student/StudentDashboard';
import { ExamCatalog } from './features/student/ExamCatalog';
import { ExamDetailPage } from './features/student/ExamDetailPage';
import { ExamTakingPage } from './features/student/ExamTakingPage';
import { ExamResultPage } from './features/student/ExamResultPage';
import { AnswerReviewPage } from './features/student/AnswerReviewPage';
import { StudentHistoryPage } from './features/student/StudentHistoryPage';
import { StudentAnalyticsPage } from './features/student/StudentAnalyticsPage';
import { StudentProfilePage } from './features/student/StudentProfilePage';

// Teacher Pages
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { ExamManagementPage } from './features/teacher/ExamManagementPage';
import { ExamEditorPage } from './features/teacher/ExamEditorPage';
import { QuestionBuilderPage } from './features/teacher/QuestionBuilderPage';
import { ExamParticipantsPage } from './features/teacher/ExamParticipantsPage';
import { TeacherAnalyticsPage } from './features/teacher/TeacherAnalyticsPage';

// Admin Pages
import { AdminDashboard } from './features/admin/AdminDashboard';
import { UserManagementPage } from './features/admin/UserManagementPage';
import { CategoryManagementPage } from './features/admin/CategoryManagementPage';
import { AdminExamModerationPage } from './features/admin/AdminExamModerationPage';
import { AdminAnalyticsPage } from './features/admin/AdminAnalyticsPage';

// Protected Route Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="space-y-4 max-w-md w-full">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not authorized for this specific portal, redirect to user's home dashboard
    if (user.role === UserRole.Admin) return <Navigate to="/admin/dashboard" replace />;
    if (user.role === UserRole.Teacher) return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root Dashboard Redirector based on user role
const RootDashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === UserRole.Admin) return <Navigate to="/admin/dashboard" replace />;
  if (user.role === UserRole.Teacher) return <Navigate to="/teacher/dashboard" replace />;
  return <StudentDashboard />;
};

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isTakingExam = location.pathname.startsWith('/take/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Main Layout Container */}
      <div className="flex-1 flex">
        {/* Sidebar (hidden on live test page or when unauthenticated) */}
        {!isTakingExam && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Content Page Area */}
        <main
          className={`flex-1 w-full transition-all duration-300 ${
            !isTakingExam ? 'lg:pl-64' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Student / Common Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RootDashboardRedirect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RootDashboardRedirect />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams"
                element={
                  <ProtectedRoute>
                    <ExamCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exams/:id"
                element={
                  <ProtectedRoute>
                    <ExamDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/take/:id"
                element={
                  <ProtectedRoute>
                    <ExamTakingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results/:id"
                element={
                  <ProtectedRoute>
                    <ExamResultPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review/:id"
                element={
                  <ProtectedRoute>
                    <AnswerReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <StudentHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <StudentAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <StudentProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <StudentProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Teacher Portal Protected Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <ExamManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams/new"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <ExamEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <ExamEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams/:examId/questions"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <QuestionBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/exams/:examId/participants"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <ExamParticipantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/analytics"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Teacher, UserRole.Admin]}>
                    <TeacherAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                    <CategoryManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/exams"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                    <AdminExamModerationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.Admin]}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
export default App;
