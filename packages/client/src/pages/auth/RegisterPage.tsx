import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, GraduationCap, BookOpen, AlertTriangle } from 'lucide-react';
import { userRegisterSchema, UserRegisterInput, USER_ROLES } from '@edusphere/shared';
import { authApi } from '@/services/api/auth.api';
import { useAuthStore } from '@/store/authStore';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UserRegisterInput>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: { roles: [USER_ROLES.STUDENT] },
  });

  const password = watch('password', '');

  const passwordStrength = () => {
    if (!password) return null;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
    ].filter(Boolean).length;
    if (checks <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (checks === 3) return { label: 'Fair', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };
  const strength = passwordStrength();

  const onSubmit = async (data: UserRegisterInput) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await authApi.register(data);
      login(response.accessToken, response.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Already have one?{' '}
            <Link to="/login" className="font-medium text-primary-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                  First name
                </label>
                <input
                  {...register('firstName')}
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                  Last name
                </label>
                <input
                  {...register('lastName')}
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-900/20"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
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
              {strength && (
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
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Role — radio buttons so exactly one is always selected */}
            <div>
              <p className="block text-sm font-medium text-slate-700 mb-2">I want to:</p>
              <Controller
                name="roles"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Student */}
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
                        field.value?.includes(USER_ROLES.STUDENT) && !field.value?.includes(USER_ROLES.TUTOR)
                          ? 'border-primary-900 bg-primary-900/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={field.value?.includes(USER_ROLES.STUDENT) && !field.value?.includes(USER_ROLES.TUTOR)}
                        onChange={() => field.onChange([USER_ROLES.STUDENT])}
                      />
                      <BookOpen size={18} className="text-primary-900 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Learn</p>
                        <p className="text-xs text-slate-500">Student</p>
                      </div>
                    </label>

                    {/* Tutor */}
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
                        field.value?.includes(USER_ROLES.TUTOR)
                          ? 'border-primary-900 bg-primary-900/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={!!field.value?.includes(USER_ROLES.TUTOR)}
                        onChange={() => field.onChange([USER_ROLES.TUTOR])}
                      />
                      <GraduationCap size={18} className="text-primary-900 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Teach</p>
                        <p className="text-xs text-slate-500">Tutor</p>
                      </div>
                    </label>
                  </div>
                )}
              />
              {errors.roles && (
                <p className="mt-1 text-xs text-red-500">{errors.roles.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            By creating an account you agree to our{' '}
            <span className="underline cursor-pointer">Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
