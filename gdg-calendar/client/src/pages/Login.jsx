import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import BracketMark from '../components/common/BracketMark.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { user, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (user) {
    const dest = location.state?.from?.pathname || '/';
    return <Navigate to={dest} replace />;
  }

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      const dest = location.state?.from?.pathname || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4">
      <button
        type="button"
        onClick={toggleTheme}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4 text-gdg-yellow" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-sm animate-fade-up">
        <div className="mb-6 flex items-center gap-3">
          <BracketMark className="h-11 w-11" />
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">GDG on Campus</h1>
            <p className="text-sm text-[var(--text-muted)]">Sign in to manage chapter events</p>
          </div>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-3 text-sm text-gdg-red"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
              placeholder="admin@gdg.local"
            />
            {errors.email && <p className="mt-1 text-xs text-gdg-red">{errors.email.message}</p>}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-gdg-red">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] w-full rounded-xl bg-gdg-blue px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 border-t border-[var(--border-subtle)] pt-4 text-center">
          <Link to="/e" className="text-xs font-medium text-gdg-blue hover:underline">
            Browse public chapter events →
          </Link>
        </div>
      </div>
    </div>
  );
}
