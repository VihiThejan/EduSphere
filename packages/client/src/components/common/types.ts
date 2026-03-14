import { LucideIcon } from 'lucide-react';

export interface AppNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}
