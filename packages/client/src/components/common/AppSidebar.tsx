import React from 'react';
import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppNavItem } from './types';

interface AppSidebarProps {
  primaryItems: AppNavItem[];
  secondaryItems?: AppNavItem[];
  streakDays?: number;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ primaryItems, secondaryItems = [], streakDays }) => {
  const renderItem = (item: AppNavItem) => {
    const Icon = item.icon;
    const className = item.active
      ? 'flex items-center gap-3 rounded-lg bg-primary-900 px-3 py-2 text-sm font-medium text-white'
      : 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-primary-900/5 hover:text-primary-900';

    if (item.href.startsWith('#')) {
      return (
        <a key={item.label} href={item.href} className={className}>
          {Icon ? <Icon size={16} /> : null}
          {item.label}
        </a>
      );
    }

    return (
      <Link key={item.label} to={item.href} className={className}>
        {Icon ? <Icon size={16} /> : null}
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-64 shrink-0 flex-col border-r border-primary-900/10 bg-white lg:flex">
      <nav className="flex-1 space-y-1 p-4">
        {primaryItems.map(renderItem)}
        {secondaryItems.length > 0 ? <div className="my-4 h-px bg-primary-900/10" /> : null}
        {secondaryItems.map(renderItem)}
      </nav>

      {typeof streakDays === 'number' ? (
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
      ) : null}
    </aside>
  );
};

export default AppSidebar;
