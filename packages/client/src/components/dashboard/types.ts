import { LucideIcon } from 'lucide-react';

export interface DashboardNavItem {
  label: string;
  href: string;
  active?: boolean;
  icon: LucideIcon;
}

export interface DashboardStat {
  label: string;
  value: string;
  description: string;
  descriptionClassName: string;
  icon: LucideIcon;
}

export interface LearningCourse {
  category: string;
  title: string;
  progressLabel: string;
  progressPercent: number;
  imageUrl: string;
}

export interface KuppiSession {
  title: string;
  subtitle: string;
  avatarUrl: string;
}
