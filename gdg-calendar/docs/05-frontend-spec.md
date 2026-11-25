# 05: Frontend Specification (client/)

## Folder structure
```
client/
├── package.json            # Vite + React
├── .env.example
├── index.html
└── src/
    ├── main.jsx, App.jsx
    ├── api/                # axios instance (token interceptor), auth.js, events.js, tasks.js, sessions.js, ...
    ├── context/            # AuthContext
    ├── hooks/              # useAuth, useSocket, useEvents
    ├── components/
    │   ├── layout/         # Navbar, Sidebar, ProtectedRoute, RoleGate
    │   ├── calendar/       # CalendarView (FullCalendar), EventModal, ConflictWarning
    │   ├── events/         # EventForm, StatusBadge, TeamPicker, TemplateSelect
    │   ├── runsheet/       # RunSheetEditor (day tabs, drag to reorder), LiveRunSheet
    │   ├── tasks/          # TaskBoard (3 columns), TaskCard, MyTasksList
    │   ├── checkin/        # QRScanner, AttendanceCounter
    │   └── common/         # Button, Modal, Input, Toast, Loader, EmptyState
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx        # upcoming events, my tasks, quick stats
    │   ├── CalendarPage.jsx
    │   ├── EventDetail.jsx      # tabs: Overview | Run Sheet | Tasks | Registrations | Feedback
    │   ├── EventCreate.jsx
    │   ├── MyTasks.jsx
    │   ├── CheckIn.jsx          # scanner + live counter
    │   ├── LiveView.jsx         # big-screen run sheet with countdown
    │   ├── Templates.jsx        # admin
    │   ├── BlockedDates.jsx     # admin
    │   ├── Team.jsx             # admin
    │   ├── Analytics.jsx
    │   └── public/ PublicEvents.jsx, PublicEventPage.jsx, RegisterSuccess.jsx (shows QR), FeedbackForm.jsx
    └── utils/              # dates.js (UTC -> IST), constants.js, statusColors.js
```

## Routes
| Path | Page | Access |
|---|---|---|
| /login | Login | public |
| / | Dashboard | auth |
| /calendar | CalendarPage | auth |
| /events/new | EventCreate | A, H |
| /events/:id | EventDetail | auth |
| /events/:id/live | LiveView | auth |
| /events/:id/checkin | CheckIn | A, H |
| /tasks | MyTasks | auth |
| /templates, /blocked-dates, /team | admin pages | A |
| /analytics | Analytics | A, H |
| /e | PublicEvents | public |
| /e/:slug | PublicEventPage | public |
| /e/:slug/feedback | FeedbackForm | public |

## Key UI behaviours
- **Calendar:** FullCalendar with month, week, and list views. Colour by status (idea grey, planned blue, confirmed green, ongoing orange, done dark, cancelled red). Blocked dates shown as shaded background events. Click a date to create, click an event to open a modal with quick actions.
- **Conflict warning:** when saving an event and API returns 409, show a dialog listing clashes with "Save anyway" and "Change date".
- **Event form:** choose template, auto-preview the checklist that will be created.
- **Run sheet editor:** day tabs (Day 1, Day 2...), add session, drag to reorder, inline time editing. Multi-day events show tabs; single-day shows one list.
- **Task board:** three columns, drag between columns, filter by domain and assignee, overdue badge.
- **Check-in:** camera QR scanner, success/duplicate/invalid feedback with sound or colour flash, live counter "42 / 120 checked in".
- **Live view:** large fonts, current session highlighted, countdown to next session, auto-updates via Socket.io.
- **Public pages:** mobile-first, no login, "Add to Google Calendar" link, registration form with validation, QR shown after registration (downloadable).
- **Analytics:** charts (Recharts): registrations vs attendance, rating trends, branch/year split, events per month.

## UX and quality rules
- Mobile-first responsive design. Skeleton loaders and empty states. Toast on every action result.
- Protect routes with `ProtectedRoute` and `RoleGate`. Redirect 401 to /login.
- Forms: react-hook-form + zod resolver.
- Accessible: labels, focus states, keyboard navigation, sufficient contrast.
- Theme: clean, Google-inspired palette (blue #4285F4, red #EA4335, yellow #FBBC05, green #34A853) on white/neutral backgrounds, with dark mode if time permits.

## Dependencies
react, react-dom, react-router-dom, axios, @fullcalendar/react (+ daygrid, timegrid, list, interaction), socket.io-client, react-hook-form, zod, @hookform/resolvers, html5-qrcode, recharts, date-fns, date-fns-tz, @dnd-kit/core (+ sortable), tailwindcss, lucide-react.
