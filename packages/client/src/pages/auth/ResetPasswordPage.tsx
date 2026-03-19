import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { authApi } from '@/services/api/auth.api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: '', width: '0%' };
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;
    if (checks <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (checks <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
        'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Invalid Link</h2>
          <p className="text-sm text-slate-500 mb-4">
            This reset link is missing its token. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block rounded-lg bg-primary-900 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-800 transition"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {done ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Password reset!</h2>
              <p className="text-sm text-slate-500">
                Your password has been updated. Redirecting you to sign in…
              </p>
              <Link
                to="/login"
                className="text-sm font-medium text-primary-900 hover:underline"
              >
                Sign in now
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full transition-all ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className={`text-xs font-medium ${
                        strength.label === 'Weak' ? 'text-red-500' :
                        strength.label === 'Fair' ? 'text-yellow-600' : 'text-emerald-600'
                      }`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm password
                  </label>
                  <input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                <Link to="/login" className="font-medium text-primary-900 hover:underline">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
