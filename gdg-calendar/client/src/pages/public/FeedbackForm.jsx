import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Star } from 'lucide-react';
import { submitPublicFeedbackRequest } from '../../api/analytics.js';
import ConfettiBurst from '../../components/common/ConfettiBurst.jsx';

const feedbackSchema = z.object({
  qrToken: z.string().trim().min(10, 'Enter your registration QR token'),
  rating: z.coerce.number().int().min(1).max(5),
  liked: z.string().trim().optional(),
  improve: z.string().trim().optional(),
  comments: z.string().trim().optional(),
});

export default function FeedbackForm() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      qrToken: searchParams.get('token') || '',
      rating: 5,
      liked: '',
      improve: '',
      comments: '',
    },
  });

  const currentRating = Number(watch('rating') || 5);

  const onSubmit = async (values) => {
    setError('');
    try {
      await submitPublicFeedbackRequest(slug, values);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit feedback');
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4">
        <ConfettiBurst trigger={submitted} />
        <div className="w-full max-w-md rounded-2xl border border-emerald-200 bg-[var(--bg-surface)] p-8 text-center animate-fade-up dark:border-emerald-900/60">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gdg-green" />
          <h1 className="mt-3 font-heading text-xl font-bold text-[var(--text-primary)]">
            Thank you for your feedback!
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Your response helps us improve future GDG events.
          </p>
          <Link
            to={`/e/${slug}`}
            className="mt-5 inline-block rounded-xl bg-gdg-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Back to event page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm animate-fade-up sm:p-8">
        <h1 className="font-heading text-xl font-bold text-[var(--text-primary)]">
          Event feedback
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Share your thoughts using your registration QR token.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="fb-token" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Registration QR token
            </label>
            <input
              id="fb-token"
              type="text"
              {...register('qrToken')}
              placeholder="Paste your 21-character token"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 font-mono text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
            />
            {errors.qrToken && (
              <p className="mt-1 text-xs text-gdg-red">{errors.qrToken.message}</p>
            )}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Rating
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  className={`rounded-lg border p-2 transition ${star <= currentRating
                      ? 'border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-700 dark:bg-amber-950/40'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fb-liked" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              What did you like?
            </label>
            <input
              id="fb-liked"
              type="text"
              {...register('liked')}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="fb-improve" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              What could we improve?
            </label>
            <input
              id="fb-improve"
              type="text"
              {...register('improve')}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="fb-comments" className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Additional comments
            </label>
            <textarea
              id="fb-comments"
              rows={3}
              {...register('comments')}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gdg-blue px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 active:scale-[0.99] disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

