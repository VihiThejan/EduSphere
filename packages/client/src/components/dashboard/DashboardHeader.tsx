import React from 'react';
import { Bell, GraduationCap, Search } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  studentId: string;
  avatarUrl: string;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  studentId,
  avatarUrl,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-primary-900/10 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-900 text-white">
            <GraduationCap size={18} />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-primary-900">EduSphere</h2>
        </div>

        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search courses, tutors, or sessions..."
            className="w-full rounded-lg border border-primary-900/10 bg-primary-900/5 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-primary-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-primary-900/10"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden h-8 w-px bg-primary-900/10 md:block" />

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900">{userName}</p>
            <p className="text-xs text-slate-500">Student ID: {studentId}</p>
          </div>

          <img
            src={avatarUrl}
            alt="Student profile avatar"
            className="h-10 w-10 rounded-full border-2 border-primary-900/20 object-cover"
          />

          <button
            type="button"
            onClick={onLogout}
            className="hidden rounded-lg border border-primary-900/20 px-3 py-2 text-xs font-semibold text-primary-900 transition hover:bg-primary-900/5 lg:inline-flex"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
