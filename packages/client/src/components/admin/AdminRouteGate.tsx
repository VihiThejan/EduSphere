import React from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: React.ReactNode;
}

const AdminRouteGate: React.FC<Props> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isAdmin = user?.roles?.includes('admin');
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="h-16 w-16 text-red-400" />
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-500">You need administrator privileges to view this page.</p>
          <a href="/dashboard" className="rounded-lg bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRouteGate;
