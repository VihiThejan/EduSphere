import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppFooter, AppHeader, AppNavItem } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { ordersApi } from '@/services/api/orders.api';
import { IOrderItem } from '@edusphere/shared';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [search, setSearch] = React.useState('');

  const navItems: AppNavItem[] = [
    { label: 'Courses', href: '/courses' },
    { label: 'Marketplace', href: '/marketplace' },
  ];

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: () => ordersApi.getOrder(orderId as string),
    enabled: isAuthenticated && Boolean(orderId),
  });

  if (!orderId) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader
        navItems={navItems}
        search={search}
        searchPlaceholder="Search courses, resources..."
        onSearchChange={setSearch}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Student'}
        userMeta={isAuthenticated ? 'Order Details' : undefined}
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Order Details</h1>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading order details...</div>
        ) : isError || !order ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Unable to load this order.
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <p className="text-lg font-bold text-slate-900">{order.orderNumber}</p>
                </div>
                <div className="text-sm">
                  <p><span className="text-slate-500">Payment:</span> <span className="font-semibold text-slate-900">{order.paymentStatus}</span></p>
                  <p><span className="text-slate-500">Fulfillment:</span> <span className="font-semibold text-slate-900">{order.fulfillmentStatus}</span></p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Items</h2>
              <div className="space-y-4">
                {order.items.map((item: IOrderItem) => (
                  <div key={item.itemId} className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                    <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary-900">LKR {(item.price * item.quantity).toLocaleString()}.00</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Summary</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between"><span>Subtotal</span><span>LKR {order.subtotal.toLocaleString()}.00</span></div>
                <div className="flex justify-between"><span>Service Fee</span><span>LKR {order.serviceFee.toLocaleString()}.00</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900"><span>Total</span><span>LKR {order.total.toLocaleString()}.00</span></div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              {(order.paymentStatus === 'pending' || order.paymentStatus === 'failed') ? (
                <Link
                  to="/checkout"
                  state={{ orderId: order._id }}
                  className="inline-flex items-center justify-center rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-800"
                >
                  Resume Payment
                </Link>
              ) : null}
              <Link
                to="/marketplace"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default OrderDetailPage;
