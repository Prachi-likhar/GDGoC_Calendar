import { useCallback, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastContext } from './toastContext.js';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-50 flex max-w-sm flex-col gap-2 lg:bottom-5"
      >
        {toasts.map((toast) => {
          const Icon =
            toast.type === 'success'
              ? CheckCircle2
              : toast.type === 'error'
                ? AlertCircle
                : Info;
          const border =
            toast.type === 'success'
              ? 'border-gdg-green/40 text-gdg-green'
              : toast.type === 'error'
                ? 'border-gdg-red/40 text-gdg-red'
                : 'border-gdg-blue/40 text-gdg-blue';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-[var(--bg-surface)] px-4 py-3 text-sm shadow-lg animate-fade-up ${border}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-[var(--text-primary)]">{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

