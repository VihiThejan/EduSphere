import React from 'react';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import {
  BillingAddressForm,
  CardPaymentForm,
  CheckoutBreadcrumbs,
  CheckoutPaymentMethod,
  OrderSummaryCard,
  PaymentMethodSelector,
  TrustBadges,
} from '@/components/checkout';
import summaryJson from '@/data/mock/checkout-summary.json';
import { useAuthStore } from '@/store/authStore';

const CheckoutPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<CheckoutPaymentMethod>('card');

  const navItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  const summary = summaryJson as {
    items: Array<{ id: string; title: string; subtitle: string; price: number; imageUrl: string }>;
    serviceFee: number;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={navItems}
        search={search}
        searchPlaceholder="Search courses, resources..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta={isAuthenticated ? 'Secure Checkout' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CheckoutBreadcrumbs />
        <h1 className="mb-8 text-3xl font-bold">Secure Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
              {paymentMethod === 'card' ? <CardPaymentForm /> : null}
            </section>

            <BillingAddressForm />
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <OrderSummaryCard summary={summary} />
              <TrustBadges />
            </div>
          </aside>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default CheckoutPage;
