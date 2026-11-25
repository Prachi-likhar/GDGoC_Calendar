import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Monitor, Moon, Sun } from 'lucide-react';
import { changePasswordRequest } from '../api/auth.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { useToast } from '../hooks/useToast.js';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export default function Profile() {
  const { user, logout } = useAuth();
  const { preference, setTheme } = useTheme();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '' },
  });

  const onSubmit = async (values) => {
    setError('');
    try {
      await changePasswordRequest(values);
      reset();
      showToast('Password updated successfully', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update password';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const themes = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile & preferences</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Manage your chapter account, appearance, and password.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gdg-blue/15 font-display text-xl font-bold text-gdg-blue">
            {user?.name?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{user?.name}</h2>
            <p className="font-mono text-xs text-[var(--text-muted)]">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-gdg-blue/10 px-2.5 py-0.5 font-medium capitalize text-gdg-blue">
                {user?.role?.replace('_', ' ')}
              </span>
              <span className="rounded-full bg-gdg-green/10 px-2.5 py-0.5 font-medium capitalize text-gdg-green">
                {user?.domain}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="min-h-[44px] rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
        >
          Sign out
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Appearance</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Choose how GDG on Campus looks on this device.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const ThemeIcon = t.icon;
            const active = preference === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTheme(t.key);
                  showToast(`Theme set to ${t.label.toLowerCase()}`, 'info');
                }}
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
                  active
                    ? 'border-gdg-blue bg-gdg-blue/10 text-gdg-blue'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <ThemeIcon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-gdg-blue" />
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Change password</h2>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-gdg-red/30 bg-gdg-red/10 px-4 py-2.5 text-sm text-gdg-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
          <div>
            <label
              htmlFor="curr-pw"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              Current password
            </label>
            <input
              id="curr-pw"
              type="password"
              {...register('currentPassword')}
              className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-gdg-red">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="new-pw"
              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
            >
              New password
            </label>
            <input
              id="new-pw"
              type="password"
              {...register('newPassword')}
              className="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)]"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-gdg-red">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] rounded-xl bg-gdg-blue px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

