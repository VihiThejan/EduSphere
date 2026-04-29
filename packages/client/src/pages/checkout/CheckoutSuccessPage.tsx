import React from 'react';
import { CheckCircle2, ArrowRight, ReceiptText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { PaymentStatusResponse, paymentsApi } from '@/services/api/payments.api';

interface SuccessState {
  amount?: number;
  itemCount?: number;
  orderId?: string;
  orderNumber?: string;
}

const CheckoutSuccessPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const [search, setSearch] = React.useState('');

  const state = (location.state as SuccessState) || {};
  const amount = state.amount ?? 12750;
  const itemCount = state.itemCount ?? 2;
  const orderId = state.orderId;

  const { data: paymentStatusData } = useQuery({
    queryKey: ['payment-status', orderId],
    queryFn: () => paymentsApi.getStatus(orderId as string),
    enabled: isAuthenticated && Boolean(orderId),
    refetchInterval: (query) => {
      const current = query.state.data as PaymentStatusResponse | undefined;
      if (!current) {
        return false;
      }

      return current.stripeStatus === 'processing' ? 3000 : false;
    },
  });

  const paymentStatus = paymentStatusData?.paymentStatus || 'completed';
  const isPaid = paymentStatus === 'completed';
  const canResumePayment = paymentStatus === 'pending' || paymentStatus === 'failed';
  const isProcessing = paymentStatusData?.stripeStatus === 'processing';

  const navItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={navItems}
        search={search}
        searchPlaceholder="Search courses, resources..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta={isAuthenticated ? 'Order Confirmed' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={34} />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
            {isPaid ? 'Payment Successful' : 'Payment Pending'}
          </h1>
          <p className="mt-2 text-slate-600">
            {isPaid
              ? 'Your purchase has been confirmed and a receipt has been sent to your email.'
              : 'Your order was created, but payment is not completed yet.'}
          </p>

          {isProcessing ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Payment is still processing. This page auto-refreshes every few seconds.
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ReceiptText size={16} className="text-primary-900" />
              Order Summary
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items purchased</span>
                <span className="font-semibold text-slate-800">{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total paid</span>
                <span className="font-semibold text-primary-900">LKR {amount.toLocaleString()}.00</span>
              </div>
              {orderId ? (
                <div className="flex justify-between">
                  <span>Order ID</span>
                  <span className="font-semibold text-slate-800">{orderId}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Payment status</span>
                <span className="font-semibold text-slate-800">{paymentStatus}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-800"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
            {orderId ? (
              <Link
                to={`/orders/${orderId}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View Order
              </Link>
            ) : null}
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Continue Shopping
            </Link>
            {canResumePayment && orderId ? (
              <Link
                to="/checkout"
                state={{ orderId }}
                className="inline-flex items-center justify-center rounded-xl border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-900 transition hover:bg-primary-100"
              >
                Resume Payment
              </Link>
            ) : null}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
};

export default CheckoutSuccessPage;
