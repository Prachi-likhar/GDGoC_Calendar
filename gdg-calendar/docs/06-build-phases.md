# 06: Build Phases and Acceptance Criteria

Work in order. After each phase update `PROGRESS.md`, `SKILLS.md`, and `README.md`.

## Phase 1: Foundation
**Tasks:** scaffold `server/` and `client/`; env setup; MongoDB connection; User model; JWT login; auth and role middleware; seed admin; client login page, AuthContext, protected routes, layout with sidebar.
**Done when:** admin can log in, `/auth/me` works, unauthorised routes redirect, seed script runs.

## Phase 2: Events and Calendar
**Tasks:** Event model and CRUD; conflict service and BlockedDate CRUD; calendar page with FullCalendar; event create/edit form; event detail page; conflict dialog; duplicate event.
**Done when:** events appear on the calendar with status colours, a clashing event shows a warning, blocked dates are shaded.

## Phase 3: Planning tools
**Tasks:** Template model and CRUD; auto-generate tasks on event create; Task CRUD and board; My Tasks page; Session model and run sheet editor with multi-day tabs and reorder.
**Done when:** creating an event from a template produces dated tasks; tasks can move across columns; a 2-day event can have separate run sheets.

## Phase 4: Public and event-day
**Tasks:** public event list and page; registration with QR token (email QR); QR check-in endpoint and scanner page; attendance counter; Socket.io rooms and live run sheet view.
**Done when:** a student registers and gets a QR, scanning it marks attendance, the counter updates live on another device, session edits appear live.

## Phase 5: Automation and insights
**Tasks:** reminders cron job; feedback form and API; certificates (single and zip); analytics overview; post-event report; CSV export of registrations.
**Done when:** reminder emails are sent for due tasks, feedback is stored, certificates download, dashboard shows charts.

## Phase 6: Polish and deploy
**Tasks:** validation and error edge cases, loading and empty states, responsive fixes, basic tests, security pass, deploy client to Vercel and server to Render, update README with live URLs.
**Done when:** the app is live, a full event can be created, run, and reviewed end to end.

## Optional later
Telegram/WhatsApp reminders, AI-generated descriptions and feedback summaries, Google Calendar two-way sync, dark mode.

---

## First prompt to paste into Antigravity
```
Read README.md, AGENTS.md, SKILLS.md, PROGRESS.md and every file in docs/ in order.
Then build Phase 1 exactly as specified in docs/06-build-phases.md.
Follow AGENTS.md strictly: after finishing, append an entry to PROGRESS.md,
update SKILLS.md and README.md, and tell me the next phase. Do not start Phase 2
until I confirm.
```
