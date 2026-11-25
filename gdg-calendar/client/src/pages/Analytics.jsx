import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAnalyticsOverviewRequest } from '../api/analytics.js';
import Loader from '../components/common/Loader.jsx';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnalyticsOverviewRequest()
      .then((res) => setData(res))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading analytics..." />;
  if (error) {
    return (
      <div className="rounded-xl border border-gdg-red/30 bg-gdg-red/10 p-4 text-sm text-gdg-red">
        {error}
      </div>
    );
  }

  const { totals, byType, byMonth } = data;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Chapter analytics</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Overview of events, attendance, and attendee ratings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs font-medium uppercase text-[var(--text-muted)]">Total events</p>
          <p className="mt-2 font-display text-2xl font-bold text-[var(--text-primary)]">
            {totals.events}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs font-medium uppercase text-[var(--text-muted)]">Registrations</p>
          <p className="mt-2 font-display text-2xl font-bold text-gdg-blue">
            {totals.registrations}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs font-medium uppercase text-[var(--text-muted)]">Attendance rate</p>
          <p className="mt-2 font-display text-2xl font-bold text-gdg-green">
            {totals.attendanceRate}%
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs font-medium uppercase text-[var(--text-muted)]">Avg rating</p>
          <p className="mt-2 font-display text-2xl font-bold text-amber-500">
            {totals.averageRating} / 5
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
            Events per month
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="events" fill="#4285F4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Events by type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="type" stroke="var(--text-muted)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#34A853" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
