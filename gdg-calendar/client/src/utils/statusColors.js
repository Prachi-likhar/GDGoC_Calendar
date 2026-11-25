export const EVENT_TYPES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'talk', label: 'Talk' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'study_jam', label: 'Study Jam' },
  { value: 'series', label: 'Series' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'other', label: 'Other' },
];

export const EVENT_STATUSES = [
  { value: 'idea', label: 'Idea' },
  { value: 'planned', label: 'Planned' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const STATUS_COLORS = {
  idea: {
    hex: '#64748b',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  planned: {
    hex: '#4285F4',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-gdg-blue',
  },
  confirmed: {
    hex: '#34A853',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-gdg-green',
  },
  ongoing: {
    hex: '#F97316',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  done: {
    hex: '#1e293b',
    badge: 'bg-slate-800 text-white border-slate-800',
    dot: 'bg-slate-800',
  },
  cancelled: {
    hex: '#EA4335',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-gdg-red',
  },
};

export const TYPE_GRADIENTS = {
  workshop: 'from-gdg-blue/80 via-blue-500/70 to-indigo-600/80',
  talk: 'from-gdg-green/80 via-emerald-500/70 to-teal-600/80',
  hackathon: 'from-gdg-red/80 via-rose-500/70 to-orange-500/80',
  study_jam: 'from-gdg-yellow/80 via-amber-500/70 to-orange-500/80',
  series: 'from-indigo-500/80 via-blue-600/70 to-cyan-500/80',
  meetup: 'from-emerald-500/80 via-teal-500/70 to-sky-500/80',
  other: 'from-slate-600/80 via-slate-700/70 to-slate-800/80',
};

export function getEventCoverGradient(type) {
  return TYPE_GRADIENTS[type] || TYPE_GRADIENTS.other;
}

