import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Store, Package, ShoppingCart,
  BookOpen, GraduationCap, DollarSign, TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { AppFooter, AppHeader, AppSidebar } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { useAdminSidebarItems } from '@/hooks/useSidebarItems';
import { adminApi, AdminUser } from '@/services/api/admin.api';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  color: string;
}> = ({ label, value, icon: Icon, href, color }) => (
  <Link
    to={href}
    className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
  >
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
    <ArrowRight size={16} className="shrink-0 text-slate-300 transition group-hover:text-primary-900" />
  </Link>
);

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { primaryItems, secondaryItems } = useAdminSidebarItems();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    enabled: isAuthenticated,
  });

  const headerNavItems = [
    { label: 'Admin Panel', href: '/admin/dashboard', active: true },
    { label: 'Back to Site', href: '/dashboard' },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <AppHeader
        navItems={headerNavItems}
        isAuthenticated={isAuthenticated}
        userName={user?.profile.firstName || 'Admin'}
        userMeta="Administrator"
        avatarUrl={user?.profile.avatar}
        onLogout={isAuthenticated ? () => void logout() : undefined}
      />

      <div className="flex flex-1">
        <AppSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Admin Overview</h1>
            <p className="mt-1 text-slate-500">Platform-wide statistics and management</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} href="/admin/users" color="bg-blue-500" />
                <StatCard label="Active Sellers" value={stats?.totalSellers ?? 0} icon={Store} href="/admin/sellers" color="bg-violet-500" />
                <StatCard label="Published Listings" value={stats?.totalListings ?? 0} icon={Package} href="/admin/listings" color="bg-amber-500" />
                <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={ShoppingCart} href="/admin/orders" color="bg-emerald-500" />
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <DollarSign size={20} className="mb-2 text-green-500" />
                  <p className="text-2xl font-black text-slate-900">
                    LKR {(stats?.totalRevenue ?? 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <BookOpen size={20} className="mb-2 text-primary-900" />
                  <p className="text-2xl font-black text-slate-900">{stats?.totalCourses ?? 0}</p>
                  <p className="text-sm text-slate-500">Published Courses</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <GraduationCap size={20} className="mb-2 text-sky-500" />
                  <p className="text-2xl font-black text-slate-900">{stats?.totalEnrollments ?? 0}</p>
                  <p className="text-sm text-slate-500">Active Enrollments</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <TrendingUp size={20} className="mb-2 text-rose-500" />
                  <p className="text-2xl font-black text-slate-900">
                    {stats?.totalUsers ? Math.round((stats.totalSellers / stats.totalUsers) * 100) : 0}%
                  </p>
                  <p className="text-sm text-slate-500">Seller Conversion</p>
                </div>
              </div>

              {/* Recent Users */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Recently Joined Users</h2>
                  <Link to="/admin/users" className="text-sm font-medium text-primary-900 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4">Email</th>
                        <th className="pb-3 pr-4">Roles</th>
                        <th className="pb-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentUsers ?? []).map((u: AdminUser) => (
                        <tr key={u._id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3 pr-4 font-medium text-slate-800">
                            {u.profile.firstName} {u.profile.lastName}
                          </td>
                          <td className="py-3 pr-4 text-slate-500">{u.email}</td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((r) => (
                                <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 capitalize">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <AppFooter />
    </div>
  );
};

export default AdminDashboardPage;
