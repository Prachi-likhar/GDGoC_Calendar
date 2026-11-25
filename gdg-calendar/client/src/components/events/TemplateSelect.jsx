export default function TemplateSelect({ templates = [], value, onChange }) {
  const selected = templates.find((t) => t._id === value);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="templateId" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
          Checklist template (optional)
        </label>
        <select
          id="templateId"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">No template (start blank)</option>
          {templates.map((tpl) => (
            <option key={tpl._id} value={tpl._id}>
              {tpl.name} ({tpl.tasks?.length || 0} tasks)
            </option>
          ))}
        </select>
      </div>

      {selected && selected.tasks?.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/30">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gdg-blue">
            Auto-generated checklist preview
          </p>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
            {selected.tasks.map((task, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2">
                <span>{task.title}</span>
                <span className="shrink-0 rounded bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                  {task.offsetDays >= 0 ? `T-${task.offsetDays}` : `T+${Math.abs(task.offsetDays)}`} ·{' '}
                  {task.domain}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

