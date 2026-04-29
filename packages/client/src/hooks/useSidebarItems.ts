import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Clock3,
  LayoutDashboard,
  ListChecks,
  Radio,
  Settings,
  ShoppingBag,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { AppNavItem } from '@/components/common/types';

export function useSidebarItems() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const isTutor = user?.roles?.includes('tutor') || user?.roles?.includes('admin');

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const primaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: active('/dashboard') },
    { label: 'Courses', href: '/courses', icon: BookOpen, active: active('/courses') },
    { label: 'My Learning', href: '/my-learning', icon: Clock3, active: active('/my-learning') },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, active: active('/marketplace') },
    { label: 'Listings', href: '/seller/listings', icon: ListChecks, active: active('/seller') },
    { label: 'Live Sessions', href: '/live', icon: Radio, active: active('/live') },
    ...(isTutor
      ? [{ label: 'Upload Course', href: '/tutor/upload', icon: Upload, active: active('/tutor/upload') }]
      : []),
  ];

  const secondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'Settings', href: '#settings', icon: Settings },
  ];

  return { primaryItems, secondaryItems, isTutor: !!isTutor };
}
