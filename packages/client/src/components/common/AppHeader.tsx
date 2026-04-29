import React from 'react';
import { Bell, BookOpen, ChevronDown, GraduationCap, LayoutDashboard, LogOut, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppNavItem } from './types';

interface AppHeaderProps {
  navItems: AppNavItem[];
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  isAuthenticated: boolean;
  userName?: string;
  userMeta?: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  navItems,
  search,
  searchPlaceholder = 'Search...',
  onSearchChange,
  isAuthenticated,
  userName,
  userMeta,
  avatarUrl,
  onLogout,
}) => {
  const defaultAvatar =
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80';
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 lg:px-12">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 text-primary-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-900/10">
            <GraduationCap size={17} />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">EduSphere</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`text-sm transition ${
                item.active
                  ? 'font-semibold text-primary-900'
                  : 'font-medium text-slate-600 hover:text-primary-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">
        {onSearchChange ? (
          <label className="hidden h-10 min-w-40 max-w-72 flex-1 sm:flex">
            <div className="flex h-full w-full items-center rounded-lg border border-slate-200 bg-slate-100">
              <Search className="ml-3 text-slate-500" size={16} />
              <input
                value={search ?? ''}
                onChange={(event) => onSearchChange(event.target.value)}
                className="h-full w-full border-none bg-transparent px-3 text-sm text-slate-700 outline-none"
                placeholder={searchPlaceholder}
              />
            </div>
          </label>
        ) : null}

        <button type="button" className="text-slate-600 transition hover:text-primary-900" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-slate-100"
            >
              <img
                src={avatarUrl || defaultAvatar}
                alt="User avatar"
                className="h-9 w-9 rounded-full border-2 border-primary-900/20 object-cover"
              />
              {userName ? (
                <span className="hidden text-sm font-semibold text-slate-700 md:inline">
                  {userName}
                </span>
              ) : null}
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                {(userName || userMeta) && (
                  <div className="border-b border-slate-100 px-4 py-2">
                    {userName && (
                      <p className="text-sm font-semibold text-slate-900">{userName}</p>
                    )}
                    {userMeta && <p className="text-xs text-slate-500">{userMeta}</p>}
                  </div>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <LayoutDashboard size={16} className="text-slate-400" />
                  Dashboard
                </Link>
                <Link
                  to="/courses"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <BookOpen size={16} className="text-slate-400" />
                  My Courses
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <User size={16} className="text-slate-400" />
                  Profile
                </Link>
                {onLogout && (
                  <>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-700 transition hover:text-primary-900">
              Log In
            </Link>
            <Link to="/register" className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-800">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
