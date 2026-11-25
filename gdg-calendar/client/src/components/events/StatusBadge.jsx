import { STATUS_COLORS } from '../../utils/statusColors.js';

export default function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] || STATUS_COLORS.idea;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

