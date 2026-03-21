import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { AUTH_SESSION_HINT_KEY } from './store/authStore';
import { apiClient } from './services/api/client';
import './index.css';

// Pages (to be created)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import HomePage from './pages/HomePage';
import TutorUploadPage from './pages/tutor/TutorUploadPage';
import CheckoutPage from './pages/payments/CheckoutPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { checkAuth, initializeAsGuest, isInitialized, isLoading } = useAuthStore();

  React.useEffect(() => {
    const isPublicRoute =
      location.pathname === '/' ||
      location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname === '/courses' ||
      /^\/courses\/[^/]+$/.test(location.pathname);

    if (isPublicRoute) {
      initializeAsGuest();
      return;
    }

    const hasSessionHint =
      typeof window !== 'undefined' &&
      window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === '1';
    const hasToken = !!apiClient.getAccessToken();

    if (!hasSessionHint && !hasToken) {
      initializeAsGuest();
      return;
    }

    void checkAuth();
  }, [checkAuth, initializeAsGuest, location.pathname]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm">
          Preparing your session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppBootstrap>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            {/* Tutor routes */}
            <Route
              path="/tutor/upload"
              element={
                <ProtectedRoute>
                  <TutorUploadPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
