import React from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { USER_ROLES } from '@edusphere/shared';
import { useAuthStore } from '@/store/authStore';
import { sellerProfileApi } from '@/services/api/seller-profile.api';
import { vendorBillingApi } from '@/services/api/vendor-billing.api';

interface SellerRouteGateProps {
  children: React.ReactNode;
  requireSellerRole?: boolean;
  requireProfile?: boolean;
  requireActiveBilling?: boolean;
}

const SellerRouteGate: React.FC<SellerRouteGateProps> = ({
  children,
  requireSellerRole = true,
  requireProfile = true,
  requireActiveBilling = false,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  const roles = user?.roles || [];
  const hasSellerRole =
    roles.includes(USER_ROLES.SELLER) ||
    roles.includes(USER_ROLES.TUTOR) ||
    roles.includes(USER_ROLES.ADMIN);

  const profileQuery = useQuery({
    queryKey: ['seller-route-profile'],
    queryFn: () => sellerProfileApi.getMyProfile(),
    enabled: isAuthenticated && requireProfile,
  });

  const billingQuery = useQuery({
    queryKey: ['seller-route-billing-status'],
    queryFn: () => vendorBillingApi.getMyStatus(),
    enabled: isAuthenticated && requireActiveBilling,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSellerRole && !hasSellerRole) {
    return <Navigate to="/seller/onboarding" replace />;
  }

  if (profileQuery.isLoading || billingQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Loading seller access...
      </div>
    );
  }

  if (requireProfile && !profileQuery.data?.profile) {
    return <Navigate to="/seller/onboarding" replace />;
  }

  if (requireActiveBilling && billingQuery.data?.status !== 'active') {
    return <Navigate to="/seller/billing" replace />;
  }

  return <>{children}</>;
};

export default SellerRouteGate;
