import React from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  BookText,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ContinueLearningSection from '@/components/dashboard/ContinueLearningSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import KuppiSessionsPanel from '@/components/dashboard/KuppiSessionsPanel';
import StatsGrid from '@/components/dashboard/StatsGrid';
import { DashboardNavItem, DashboardStat, KuppiSession, LearningCourse } from '@/components/dashboard/types';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuthStore();

  const userName = user?.profile.firstName ? `${user.profile.firstName}` : 'Alex Thompson';

  const primaryItems: DashboardNavItem[] = [
    { label: 'Dashboard', href: '#', active: true, icon: LayoutDashboard },
    { label: 'Courses', href: '/courses', icon: BookOpen },
    { label: 'My Learning', href: '#', icon: BookText },
    { label: 'Marketplace', href: '#', icon: ShoppingBag },
    { label: 'Listings', href: '#', icon: ListChecks },
  ];

  const secondaryItems: DashboardNavItem[] = [
    { label: 'Analytics', href: '#', icon: BarChart3 },
    { label: 'Settings', href: '#', icon: Settings },
  ];

  const stats: DashboardStat[] = [
    {
      label: 'Active Courses',
      value: '12',
      description: '+2 from last month',
      descriptionClassName: 'text-green-500',
      icon: BookOpen,
    },
    {
      label: 'Completed Hours',
      value: '458',
      description: 'Total study time',
      descriptionClassName: 'text-slate-400',
      icon: Clock3,
    },
    {
      label: 'Pending Assignments',
      value: '3',
      description: 'Due within 48h',
      descriptionClassName: 'text-red-500',
      icon: ClipboardList,
    },
    {
      label: 'Avg. Performance',
      value: '92%',
      description: 'Top 5% of class',
      descriptionClassName: 'text-green-500',
      icon: TrendingUp,
    },
  ];

  const courses: LearningCourse[] = [
    {
      category: 'Computer Science',
      title: 'Advanced Data Structures',
      progressLabel: '65% Complete',
      progressPercent: 65,
      imageUrl:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    },
    {
      category: 'Finance',
      title: 'Microeconomics Principles',
      progressLabel: '20% Complete',
      progressPercent: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1638913662252-70efce1e60a7?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const sessions: KuppiSession[] = [
    {
      title: 'Python for Beginners',
      subtitle: 'by Kavindu Perera - Today, 4PM',
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      title: 'Matrix Algebra Hub',
      subtitle: 'by Sarah Jenkins - Tomorrow, 10AM',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    },
    {
      title: 'Operating Systems',
      subtitle: 'by OS Group - Wed, 6PM',
      avatarUrl:
        'https://images.unsplash.com/photo-1525873765963-8931ab571545?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <DashboardHeader
        userName={userName}
        studentId="#22941"
        avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
        onLogout={() => {
          void logout();
        }}
      />

      <div className="flex flex-1">
        <DashboardSidebar primaryItems={primaryItems} secondaryItems={secondaryItems} streakDays={14} />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-4xl">Welcome back, {userName}!</h1>
              <p className="mt-1 text-slate-500">
                You&apos;ve completed 75% of your weekly goals. Keep it up!
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800"
            >
              <Plus size={16} />
              Join New Session
            </button>
          </div>

          <StatsGrid stats={stats} />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <ContinueLearningSection courses={courses} />
            <KuppiSessionsPanel sessions={sessions} />
          </div>

          <div className="mt-8 rounded-xl border border-primary-900/10 bg-white p-4 lg:hidden">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-900">
              <Activity size={16} />
              Study Streak
            </div>
            <p className="text-lg font-bold text-slate-900">14 Days</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
