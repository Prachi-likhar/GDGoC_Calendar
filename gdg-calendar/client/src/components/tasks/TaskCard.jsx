import { ArrowLeft, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import { formatISTDateOnly } from '../../utils/dates.js';

const PRIORITY_BADGE = {
  low: 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
  medium: 'bg-gdg-yellow/15 text-amber-600 dark:text-gdg-yellow',
  high: 'bg-gdg-red/15 text-gdg-red',
};

export default function TaskCard({
  task,
  canEdit,
  canMove,
  onStatusChange,
  onDelete,
  onDragStart,
}) {
  const isDone = task.status === 'done';
  const isOverdue = !isDone && new Date(task.dueDate) < new Date();

  return (
    <div
      draggable={canMove}
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      className={`rounded-2xl border bg-[var(--bg-surface)] p-3.5 shadow-sm transition-all hover:shadow ${isOverdue
          ? 'border-gdg-red/40'
          : isDone
            ? 'border-gdg-green/30 opacity-85'
            : 'border-[var(--border-subtle)]'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {isDone && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gdg-green" />}
          <p
            className={`text-sm font-medium ${isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
              }`}
          >
            {task.title}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => onDelete(task._id)}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-gdg-red/10 hover:text-gdg-red"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="rounded-md bg-gdg-blue/10 px-2 py-0.5 font-medium capitalize text-gdg-blue">
          {task.domain}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 font-medium capitalize ${PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium
            }`}
        >
          {task.priority}
        </span>
        {isOverdue && (
          <span className="rounded-md bg-gdg-red/15 px-2 py-0.5 font-semibold text-gdg-red">
            Overdue
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Due {formatISTDateOnly(task.dueDate)}</span>
        <span>{task.assignee?.name || 'Unassigned'}</span>
      </div>

      {canMove && (
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2">
          {task.status !== 'todo' ? (
            <button
              type="button"
              onClick={() =>
                onStatusChange(task._id, task.status === 'done' ? 'in_progress' : 'todo')
              }
              className="inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : (
            <span />
          )}
          {task.status !== 'done' && (
            <button
              type="button"
              onClick={() =>
                onStatusChange(task._id, task.status === 'todo' ? 'in_progress' : 'done')
              }
              className="inline-flex min-h-[32px] items-center gap-1 text-xs font-semibold text-gdg-blue hover:text-blue-600"
            >
              {task.status === 'todo' ? 'Start' : 'Mark done'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
