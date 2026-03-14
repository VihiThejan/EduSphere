import React from 'react';
import { DashboardStat } from './types';

interface StatsGridProps {
  stats: DashboardStat[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article key={stat.label} className="rounded-xl border border-primary-900/10 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <Icon className="text-primary-900" size={16} />
            </div>
            <p className="mt-2 text-4xl font-bold leading-none text-slate-900">{stat.value}</p>
            <p className={`mt-2 text-xs ${stat.descriptionClassName}`}>{stat.description}</p>
          </article>
        );
      })}
    </div>
  );
};

export default StatsGrid;
