import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from './store/authStore';
import { config } from './config';
import './index.css';

// Pages (to be created)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import MarketplaceDetailPage from './pages/marketplace/MarketplaceDetailPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutSuccessPage from './pages/checkout/CheckoutSuccessPage';
import HomePage from './pages/HomePage';
import TutorUploadPage from './pages/tutor/TutorUploadPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import LiveSessionPage from './pages/live/LiveSessionPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Never retry on 401/403 — those need auth changes, not retries
        const status = error?.response?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 1;
      },
    },
  },
});

const stripePromise = config.stripePublishableKey
  ? loadStripe(config.stripePublishableKey)
  : null;

// Loading screen shown while restoring session
const AppLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-900 border-t-transparent" />
      <p className="text-sm text-slate-500">Loading EduSphere…</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <AppLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <AppLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { initAuth, isInitialized } = useAuthStore();

  // Run once on mount: try to restore session from the refresh cookie
  useEffect(() => {
    if (!isInitialized) {
      initAuth();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appRoutes = (
    <BrowserRouter>
      <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:listingId" element={<MarketplaceDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
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

          {/* Live sessions */}
          <Route
            path="/live"
            element={
              <ProtectedRoute>
                <LiveSessionPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {stripePromise ? <Elements stripe={stripePromise}>{appRoutes}</Elements> : appRoutes}
    </QueryClientProvider>
  );
}

export default App;
