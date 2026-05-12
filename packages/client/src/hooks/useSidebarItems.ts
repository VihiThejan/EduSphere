import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Clock3,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Package,
  Radio,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  Upload,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import type { AppNavItem } from '@/components/common/types';

export function useSidebarItems() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  const roles = user?.roles ?? [];
  const isTutor = roles.includes('tutor') || roles.includes('admin');
  const isSeller = roles.includes('seller') || roles.includes('admin');
  const isAdmin = roles.includes('admin');

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const primaryItems: AppNavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: active('/dashboard') },
    { label: 'Courses', href: '/courses', icon: BookOpen, active: active('/courses') },
    { label: 'My Learning', href: '/my-learning', icon: Clock3, active: active('/my-learning') },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, active: active('/marketplace') },
    { label: 'Live Sessions', href: '/live', icon: Radio, active: active('/live') },

    ...(isTutor
      ? [
          { label: 'Tutor Hub', href: '/tutor/dashboard', icon: GraduationCap, active: active('/tutor/dashboard') },
          { label: 'Upload Course', href: '/tutor/upload', icon: Upload, active: active('/tutor/upload') },
        ]
      : []),

    ...(isSeller
      ? [
          { label: 'Seller Dashboard', href: '/seller/dashboard', icon: Store, active: active('/seller/dashboard') },
          { label: 'My Listings', href: '/seller/listings', icon: Package, active: active('/seller/listings') },
          { label: 'Seller Orders', href: '/seller/orders', icon: ShoppingCart, active: active('/seller/orders') },
          { label: 'Seller Billing', href: '/seller/billing', icon: CreditCard, active: active('/seller/billing') },
          { label: 'Shop Profile', href: '/seller/profile', icon: User, active: active('/seller/profile') },
        ]
      : []),

    ...(isAdmin
      ? [{ label: 'Tutor Requests', href: '/admin/tutor-requests', icon: Shield, active: active('/admin/tutor-requests') }]
      : []),
  ];

  const secondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: isTutor ? '/tutor/analytics' : '#analytics', icon: BarChart3 },
    { label: 'Settings', href: '#settings', icon: Settings },
  ];

  return { primaryItems, secondaryItems, isTutor: !!isTutor, isSeller: !!isSeller, isAdmin: !!isAdmin };
}

export function useAdminSidebarItems() {
  const { pathname } = useLocation();

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const primaryItems: AppNavItem[] = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard, active: active('/admin/dashboard') },
    { label: 'Users', href: '/admin/users', icon: User, active: active('/admin/users') },
    { label: 'Sellers', href: '/admin/sellers', icon: Store, active: active('/admin/sellers') },
    { label: 'Listings', href: '/admin/listings', icon: Package, active: active('/admin/listings') },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, active: active('/admin/orders') },
  ];

  const secondaryItems: AppNavItem[] = [
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'Settings', href: '#settings', icon: Settings },
  ];

  return { primaryItems, secondaryItems };
}
