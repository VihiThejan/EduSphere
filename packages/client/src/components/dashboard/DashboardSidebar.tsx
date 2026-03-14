import React from 'react';
import { Flame } from 'lucide-react';
import { DashboardNavItem } from './types';

interface DashboardSidebarProps {
  primaryItems: DashboardNavItem[];
  secondaryItems: DashboardNavItem[];
  streakDays: number;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  primaryItems,
  secondaryItems,
  streakDays,
}) => {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 flex-col border-r border-primary-900/10 bg-white lg:flex">
      <nav className="flex-1 space-y-1 p-4">
        {primaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              className={
                item.active
                  ? 'flex items-center gap-3 rounded-lg bg-primary-900 px-3 py-2 text-sm font-medium text-white'
                  : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-primary-900/5 hover:text-primary-900'
              }
            >
              <Icon size={16} />
              {item.label}
            </a>
          );
        })}

        <div className="my-4 h-px bg-primary-900/10" />

        {secondaryItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-primary-900/5 hover:text-primary-900"
            >
              <Icon size={16} />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-xl bg-primary-900/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-900/60">
            Study Streak
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Flame className="text-primary-900" size={18} />
            <p className="text-lg font-bold text-slate-900">{streakDays} Days</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
