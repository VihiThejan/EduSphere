import React from 'react';
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
import SellerBillingPage from './pages/seller/SellerBillingPage';
import SellerOnboardingPage from './pages/seller/SellerOnboardingPage';
import SellerCreateListingPage from './pages/seller/SellerCreateListingPage';
import SellerListingsPage from './pages/seller/SellerListingsPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerEditListingPage from './pages/seller/SellerEditListingPage';
import SellerProfilePage from './pages/seller/SellerProfilePage';
import SellerRouteGate from './components/seller/SellerRouteGate';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const stripePromise = config.stripePublishableKey
  ? loadStripe(config.stripePublishableKey)
  : null;

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

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerDashboardPage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/billing"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerBillingPage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/onboarding"
            element={
              <ProtectedRoute>
                <SellerRouteGate requireSellerRole={false} requireProfile={false}>
                  <SellerOnboardingPage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/listings/create"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerCreateListingPage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/listings/:listingId/edit"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerEditListingPage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/listings"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerListingsPage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/profile"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerProfilePage />
                </SellerRouteGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute>
                <SellerRouteGate>
                  <SellerOrdersPage />
                </SellerRouteGate>
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
    </BrowserRouter>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {stripePromise ? <Elements stripe={stripePromise}>{appRoutes}</Elements> : appRoutes}
    </QueryClientProvider>
  );
}

export default App;
