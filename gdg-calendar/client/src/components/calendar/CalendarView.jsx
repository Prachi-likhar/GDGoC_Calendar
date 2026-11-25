import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { STATUS_COLORS } from '../../utils/statusColors.js';

export default function CalendarView({
  events = [],
  blockedDates = [],
  onEventClick,
  onDateClick,
}) {
  const calendarEvents = [
    ...events.map((ev) => {
      const color = (STATUS_COLORS[ev.status] || STATUS_COLORS.idea).hex;
      return {
        id: ev._id,
        title: ev.title,
        start: ev.startAt,
        end: ev.endAt,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { kind: 'event', raw: ev },
      };
    }),
    ...blockedDates.map((bd) => ({
      id: `blocked-${bd._id}`,
      title: `Blocked: ${bd.title}`,
      start: bd.startDate,
      end: bd.endDate,
      display: 'background',
      backgroundColor: '#fecaca',
      extendedProps: { kind: 'blocked', raw: bd },
    })),
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        timeZone="Asia/Kolkata"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek',
        }}
        height="auto"
        events={calendarEvents}
        dateClick={(info) => {
          if (onDateClick) {
            onDateClick(info.dateStr);
          }
        }}
        eventClick={(info) => {
          const { kind, raw } = info.event.extendedProps;
          if (kind === 'event' && onEventClick) {
            onEventClick(raw);
          }
        }}
      />
    </div>
  );
}

