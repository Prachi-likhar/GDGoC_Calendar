# PROGRESS.md: running project log (append only)

Everything we do is recorded here. The agent adds a new entry after every task. Newest entries go at the **bottom**.

## Entry template
```
### YYYY-MM-DD HH:MM: <short title>
- **Phase / task:**
- **What was done:**
- **Files created / changed:**
- **Decisions and reasons:**
- **Issues / blockers:**
- **How to test:**
- **Next steps:**
```

## Current status
- **Current phase:** Phase 6 complete (all v1 phases built and verified locally)
- **Last completed task:** Phase 6: Polish and deploy (Team management page, Vite chunking, Vercel SPA config, Render/Vercel deployment docs, full test & build pass)
- **Next task:** Deploy `server/` to Render, `client/` to Vercel, and update `README.md` with live URLs

---

## Log

### Project initialised
- **What was done:** Spec files created: README, AGENTS, SKILLS, PROGRESS, and `docs/01` to `docs/06`.
- **Next steps:** Start Phase 1.

### 2026-11-25 19:57: Phase 1 - Foundation
- **Phase / task:** Phase 1: Foundation
- **What was done:**
  - Scaffolded `server/` (ES modules, Express, Mongoose, Zod, JWT, bcryptjs, helmet, cors, express-rate-limit, morgan, ESLint, Vitest + Supertest + mongodb-memory-server) and `client/` (Vite, React 18, Tailwind CSS, React Router, Axios, react-hook-form, zod, lucide-react, ESLint).
  - Implemented `User` model, `auth` & `role` middleware, `validate` & `errorHandler` middleware, `/api/health`, `/api/auth` (`POST /login`, `GET /me`, `POST /register`, `PATCH /password`), and idempotent admin seed script (`seedAdmin`).
  - Built client Axios instance with Bearer token + 401 redirect interceptors, `AuthContext` + `useAuth`, `ProtectedRoute`, `RoleGate`, responsive `AppLayout` (`Sidebar` + `Navbar`), `Login` page, and `Dashboard` / placeholder pages for upcoming phases.
- **Files created / changed:**
  - `server/`: `package.json`, `.env.example`, `eslint.config.js`, `src/server.js`, `src/app.js`, `src/config/env.js`, `src/config/db.js`, `src/models/User.js`, `src/validators/auth.validator.js`, `src/services/auth.service.js`, `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`, `src/middleware/{auth,role,validate,errorHandler,rateLimit}.js`, `src/utils/{ApiError,asyncHandler}.js`, `src/seed/seed.js`, `tests/auth.test.js`.
  - `client/`: `package.json`, `.env.example`, `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `src/index.css`, `src/main.jsx`, `src/App.jsx`, `src/api/{client,auth}.js`, `src/context/{authContext.js,AuthContext.jsx}`, `src/hooks/useAuth.js`, `src/components/common/Loader.jsx`, `src/components/layout/{AppLayout,Navbar,Sidebar,ProtectedRoute,RoleGate}.jsx`, `src/pages/{Login,Dashboard,PlaceholderPage}.jsx`.
- **Decisions and reasons:**
  - `auth` middleware queries `User` by ID to verify `isActive: true` so deactivated accounts are immediately blocked from using existing JWTs.
  - `seedAdmin()` checks for an existing user by `ADMIN_EMAIL` before creating one, making `npm run seed` idempotent.
  - Added placeholder routes for `/calendar`, `/tasks`, `/analytics`, `/templates`, `/blocked-dates`, and `/team` guarded by `ProtectedRoute` and `RoleGate` so sidebar navigation and role-based redirects can be verified in Phase 1.
- **Issues / blockers:** None. Note: running `npm run seed` against a live database requires a valid `MONGO_URI` in `server/.env`.
- **How to test:**
  1. `cd server && npm run lint && npm test` (6/6 Vitest + Supertest tests pass, including login, `/auth/me`, 401/403 checks, and idempotent `seedAdmin`).
  2. `cd client && npm run lint && npm run build` (ESLint passes and Vite production build succeeds).
  3. With MongoDB configured in `server/.env`: run `cd server && npm run seed && npm run dev` and `cd client && npm run dev`, then sign in at `http://localhost:5173/login` with the seeded admin credentials.
- **Next steps:** Phase 2: Events and Calendar (awaiting user confirmation).

### 2026-11-25 20:14: Phase 2 - Events and Calendar
- **Phase / task:** Phase 2: Events and Calendar
- **What was done:**
  - Backend: Implemented `Event` and `BlockedDate` Mongoose models, Zod validators, `conflict.service.js` (`findConflicts` checking non-cancelled overlapping events and blocked dates), `event.service.js` (CRUD, `domain_head` ownership checks, 409 conflict warning with `?force=true` bypass, and `duplicateEvent`), `blockedDate.service.js`, and REST routes (`/api/events`, `/api/events/conflicts`, `/api/events/:id/duplicate`, `/api/blocked-dates`). Updated `seed.js` to also seed sample blocked dates.
  - Frontend: Installed FullCalendar (`@fullcalendar/react`, `daygrid`, `timegrid`, `list`, `interaction`) and `date-fns` + `date-fns-tz`. Added UTC <-> IST (`Asia/Kolkata`) date helpers, status colour map, `events` & `blockedDates` API modules, `CalendarView`, `EventModal`, `ConflictWarning`, `EventForm`, `StatusBadge`, `CalendarPage`, `EventCreate` (create/edit), `EventDetail`, and `BlockedDates` (admin CRUD).
- **Files created / changed:**
  - `server/`: `src/models/{Event,BlockedDate}.js`, `src/services/{conflict,event,blockedDate}.service.js`, `src/validators/{event,blockedDate}.validator.js`, `src/controllers/{event,blockedDate}.controller.js`, `src/routes/{event,blockedDate}.routes.js`, `src/app.js`, `src/utils/ApiError.js`, `src/middleware/errorHandler.js`, `src/seed/seed.js`, `tests/events.test.js`.
  - `client/`: `package.json`, `src/App.jsx`, `src/utils/{dates,statusColors}.js`, `src/api/{events,blockedDates}.js`, `src/components/events/{EventForm,StatusBadge}.jsx`, `src/components/calendar/{CalendarView,EventModal,ConflictWarning}.jsx`, `src/pages/{CalendarPage,EventCreate,EventDetail,BlockedDates}.jsx`.
- **Decisions and reasons:**
  - `ApiError` accepts an optional `extra` object so 409 conflict responses include `{ warning, clashes }` alongside `{ success: false, message }` through the centralised `errorHandler`.
  - Event slugs are auto-generated from the title plus a 6-char hex suffix to guarantee uniqueness on create and duplicate.
  - Added `/blocked-dates` admin page in Phase 2 so admins can manage blocked dates directly in the UI alongside the calendar shading.
- **Issues / blockers:** None.
- **How to test:**
  1. Automated: `cd server && npm run lint && npm test` (10/10 tests pass across `auth.test.js` and `events.test.js`) and `cd client && npm run lint && npm run build`.
  2. Manual:
     - Start backend (`cd server && npm run seed && npm run dev`) and frontend (`cd client && npm run dev`).
     - Sign in as admin at `/login`, open `/calendar`, and verify month/week/list views and shaded blocked dates.
     - Click a date (or "New event") to create an event; verify it appears on the calendar in its status colour.
     - Create another event overlapping the first event or a blocked date; verify the 409 conflict dialog appears with "Change date" and "Save anyway" (`?force=true`).
     - Click an event on the calendar to open the quick-view modal, open its detail page (`/events/:id`), test Edit, Duplicate, and Delete.
- **Next steps:** Phase 3: Planning tools (awaiting user confirmation).

### 2026-11-25 20:23: Phase 3 - Planning tools
- **Phase / task:** Phase 3: Planning tools
- **What was done:**
  - Backend: Implemented `Template`, `Task`, and `Session` models, `template.service.js` (`generateFromTemplate` calculating `dueDate = event.startAt - offsetDays * 86400000`), `task.service.js` (CRUD + assignee status-only restriction + `/tasks/mine`), `session.service.js` (multi-day CRUD + reorder), `user.service.js`, and corresponding validators, controllers, and routes. Updated `event.service.js` to auto-generate tasks from `templateId`, cascade delete children, and copy tasks/sessions on duplicate. Updated `seed.js` with default Workshop, Talk, and Hackathon templates.
  - Frontend: Built `TemplateSelect` with checklist preview in `EventForm`, `Templates` admin page, `TaskBoard` (3 columns with drag-and-drop + move buttons, domain/assignee filters, overdue badge) and `TaskCard`, `MyTasks` page, `RunSheetEditor` (multi-day tabs, add day, up/down reorder, status selector), and tabbed `EventDetail` (`Overview | Run Sheet | Tasks`).
- **Files created / changed:**
  - `server/`: `src/models/{Template,Task,Session}.js`, `src/services/{template,task,session,user}.service.js`, `src/validators/{template,task,session,user}.validator.js`, `src/controllers/{template,task,session,user}.controller.js`, `src/routes/{template,task,session,user}.routes.js`, `src/services/event.service.js`, `src/routes/event.routes.js`, `src/app.js`, `src/seed/seed.js`, `tests/planning.test.js`.
  - `client/`: `src/api/{templates,tasks,sessions,users}.js`, `src/components/events/{TemplateSelect,EventForm}.jsx`, `src/components/tasks/{TaskBoard,TaskCard}.jsx`, `src/components/runsheet/RunSheetEditor.jsx`, `src/pages/{EventCreate,EventDetail,MyTasks,Templates}.jsx`, `src/App.jsx`.
- **Decisions and reasons:**
  - Used native HTML5 drag-and-drop plus accessible move buttons on `TaskBoard` and `RunSheetEditor` to avoid extra bundle weight while supporting both mouse and keyboard/mobile interaction.
- **Issues / blockers:** None.
- **How to test:**
  1. `cd server && npm run lint && npm test` (13/13 tests pass including `tests/planning.test.js`).
  2. `cd client && npm run lint && npm run build`.
- **Next steps:** Proceed to Phase 4: Public and event-day.

### 2026-11-25 20:42: Phase 4 - Public and event-day
- **Phase / task:** Phase 4: Public and event-day
- **What was done:**
  - Backend: Implemented `Registration` model (`{ eventId, email }` unique index, `nanoid(21)` `qrToken`), `qr.js` (token & PNG data URL), `mail.js` + `mail.service.js` (graceful no-op when SMTP is unconfigured), `registration.service.js` (public event list/detail, capacity & duplicate-email guarded registration, QR email, check-in with 409 duplicate check, CSV export, attendance stats), `sockets/index.js` (`event:<eventId>` rooms), and `public.routes.js`.
  - Frontend: Built `useSocket` hook, `PublicEvents` (`/e`), `PublicEventPage` (`/e/:slug` with Google Calendar link & registration form), `RegisterSuccess` (QR pass display & download), `CheckIn` (`/events/:id/checkin` with `html5-qrcode` camera scanner, manual token fallback, and live `AttendanceCounter`), `LiveView` (`/events/:id/live` with `LiveRunSheet` updating live over Socket.io), and `Registrations` tab in `EventDetail`.
- **Files created / changed:**
  - `server/`: `package.json`, `vitest.config.js`, `src/config/{env,mail}.js`, `src/models/Registration.js`, `src/utils/qr.js`, `src/services/{mail,registration}.service.js`, `src/validators/registration.validator.js`, `src/controllers/registration.controller.js`, `src/routes/{public,event}.routes.js`, `src/sockets/index.js`, `src/app.js`, `src/server.js`, `tests/eventDay.test.js`.
  - `client/`: `package.json`, `src/hooks/useSocket.js`, `src/api/{public,registrations}.js`, `src/components/checkin/{AttendanceCounter,QRScanner}.jsx`, `src/components/runsheet/LiveRunSheet.jsx`, `src/pages/public/{PublicEvents,PublicEventPage,RegisterSuccess}.jsx`, `src/pages/{CheckIn,LiveView,EventDetail}.jsx`, `src/App.jsx`.
- **Decisions and reasons:**
  - Set `fileParallelism: false` in `server/vitest.config.js` so `MongoMemoryServer` instances start sequentially without 10s port-startup contention on Windows.
  - Mailer skips sending when `SMTP_HOST` is blank so local development and automated tests work without SMTP credentials.
- **Issues / blockers:** None.
- **How to test:**
  1. `cd server && npm run lint && npm test` (14/14 tests pass including `tests/eventDay.test.js`).
  2. `cd client && npm run lint && npm run build`.
- **Next steps:** Proceed to Phase 5: Automation and insights.

### 2026-11-25 20:58: Phase 5 - Automation and insights
- **Phase / task:** Phase 5: Automation and insights
- **What was done:**
  - Backend: Implemented `Feedback` model, `feedback.service.js` (one-per-registration validation via `qrToken`), `certificate.service.js` (PDFKit certificate generation for checked-in attendees + Archiver ZIP stream), `report.service.js` (chapter analytics overview + event report JSON & PDF), `reminders.job.js` (`node-cron` daily at 08:00 IST for due tasks and 24h confirmed event reminders), and `insights.controller.js` + `analytics.routes.js`.
  - Frontend: Built `FeedbackForm` (`/e/:slug/feedback`), `Analytics` (`/analytics` with Recharts bar charts), updated `Dashboard` with upcoming events and pending tasks, and updated `EventDetail` with Feedback tab, CSV export, Certificates ZIP download, and Report PDF download.
- **Files created / changed:**
  - `server/`: `src/models/Feedback.js`, `src/services/{certificate,feedback,report}.service.js`, `src/jobs/reminders.job.js`, `src/validators/feedback.validator.js`, `src/controllers/insights.controller.js`, `src/routes/{analytics,public,event}.routes.js`, `src/app.js`, `src/server.js`, `tests/insights.test.js`.
  - `client/`: `src/api/analytics.js`, `src/pages/public/FeedbackForm.jsx`, `src/pages/{Analytics,Dashboard,EventDetail}.jsx`, `src/App.jsx`.
- **Decisions and reasons:**
  - Exported `runRemindersTick()` separately from `startRemindersJob()` so reminder logic can be verified deterministically in automated tests.
- **Issues / blockers:** None.
- **How to test:**
  1. `cd server && npm run lint && npm test` (15/15 tests pass across 5 suites).
  2. `cd client && npm run lint && npm run build`.
- **Next steps:** Proceed to Phase 6: Polish and deploy.

### 2026-11-25 21:10: Phase 6 - Polish and deploy
- **Phase / task:** Phase 6: Polish and deploy
- **What was done:**
  - Built `Team.jsx` (`/team`) and `createUserRequest` so admins can add members (`POST /api/auth/register`) and manage roles, domains, and active status (`PATCH /api/users/:id`).
  - Added Vite `manualChunks` configuration (`vendor`, `calendar`, `charts`) in `client/vite.config.js` and SPA rewrite rules in `client/vercel.json`.
  - Documented Render, Vercel, and MongoDB Atlas deployment steps in `README.md`.
  - Increased `MongoMemoryServer` `launchTimeout` to `30000`ms across all 5 server test files for reliable Windows CI/local test runs.
- **Files created / changed:**
  - `client/`: `src/pages/Team.jsx`, `src/api/users.js`, `src/App.jsx`, `client/vercel.json`, `client/vite.config.js`.
  - `server/`: `tests/{auth,events,planning,eventDay,insights}.test.js`.
  - Root: `README.md`, `PROGRESS.md`, `SKILLS.md`.
- **Decisions and reasons:**
  - Left live deployment URLs in `README.md` as placeholders since Vercel, Render, and MongoDB Atlas account credentials are external to this workspace.
- **Issues / blockers:** External hosting/DB credentials (`MONGO_URI`, Vercel, Render) are required to push live.
- **How to test:**
  1. `cd server && npm run lint && npm test` — 5/5 test files, 15/15 tests pass.
  2. `cd client && npm run lint && npm run build` — ESLint passes and Vite production build succeeds.
- **Next steps:** Configure `MONGO_URI` and deploy `server/` to Render and `client/` to Vercel using the steps in `README.md`.

### 2026-11-25 21:47: Premium UI/UX Transformation
- **Phase / task:** UI/UX Transformation (Design System, Mobile Nav, Dashboard, Discovery Cards, Event Detail, Task Board, Activity & Dark Mode)
- **What was done:**
  - Created `docs/07_DESIGN_SYSTEM.md` and updated `index.html`, `tailwind.config.js`, and `index.css` with Outfit/Inter/JetBrains Mono fonts, light/dark CSS tokens, `prefers-reduced-motion` support, and FullCalendar dark mode overrides.
  - Added `ThemeContext`, `ToastContext`, `BracketMark`, 4-colour bouncing `Loader` + `Skeleton`, `EmptyState`, `ConfettiBurst`, `MobileBottomNav` (5 sections, 44px+ touch targets, safe-area support), and `Profile` page (`/profile`).
  - Upgraded `Dashboard` (dynamic greeting, next-event countdown hero, 4 stat cards, task completion bar, weekly activity bars, recent team activity), `CalendarPage` & `PublicEvents` (`EventCard` discovery grid, search, category & timeframe filters), `EventDetail` (hero banner, Google Maps link, vertical timeline, Speakers & Team tabs, registration progress), `TaskBoard` & `MyTasks` ("My contribution" stats + completion confetti), and `Team` (volunteer recognition cards from real event ownership).
- **Files created / changed:**
  - `docs/07_DESIGN_SYSTEM.md`, `SKILLS.md`, `PROGRESS.md`.
  - `client/index.html`, `client/tailwind.config.js`, `client/src/index.css`, `client/src/App.jsx`.
  - `client/src/context/{ThemeContext,themeContext,ToastContext,toastContext}.*`, `client/src/hooks/{useTheme,useToast}.js`.
  - `client/src/components/common/{BracketMark,Loader,EmptyState,ConfettiBurst}.jsx`, `client/src/components/layout/{MobileBottomNav,Sidebar,Navbar,AppLayout}.jsx`, `client/src/components/events/EventCard.jsx`, `client/src/components/tasks/{TaskBoard,TaskCard}.jsx`, `client/src/components/calendar/CalendarView.jsx`.
  - `client/src/pages/{Login,Dashboard,Profile,CalendarPage,EventDetail,MyTasks,Team}.jsx`, `client/src/pages/public/{PublicEvents,RegisterSuccess}.jsx`.
- **Decisions and reasons:**
  - Derived recent team activity and volunteer recognition strictly from real `Event` and `Task` records without inventing fake audit logs or scores.
  - Used lightweight CSS/Canvas motion and `prefers-reduced-motion` guards instead of adding Framer Motion, keeping bundle size lean.
- **Issues / blockers:** None.
- **How to test:** `cd client && npm run lint && npm run build`.
- **Next steps:** Deploy or test interactively in the browser across mobile (375px–430px) and desktop (1024px–1440px) in both light and dark modes.

### 2026-11-26 00:09: Remaining Pages & Components Dark Mode + Polish Pass
- **Phase / task:** UI/UX Transformation (Final Dark Mode & Toast Polish across secondary pages, public forms, and modals)
- **What was done:**
  - Updated `Analytics.jsx`, `CheckIn.jsx`, `EventCreate.jsx`, `BlockedDates.jsx`, `Templates.jsx`, `PublicEventPage.jsx`, and `FeedbackForm.jsx` to use CSS theme tokens (`--bg-surface`, `--bg-canvas`, `--bg-subtle`, `--border-subtle`, `--text-*`), `font-heading`, `EmptyState`, `ConfettiBurst` (on public registration & feedback submission), and `useToast()` feedback.
  - Updated `EventModal.jsx`, `ConflictWarning.jsx`, `EventForm.jsx`, `TemplateSelect.jsx`, `RunSheetEditor.jsx`, and `AttendanceCounter.jsx` to support dark mode cleanly.
  - Extracted shared `getEventCoverGradient` helper into `client/src/utils/statusColors.js` and reused it in `EventCard.jsx` and `PublicEventPage.jsx`.
- **Files created / changed:**
  - `client/src/utils/statusColors.js`, `client/src/components/events/{EventCard,EventForm,TemplateSelect}.jsx`.
  - `client/src/components/calendar/{EventModal,ConflictWarning}.jsx`, `client/src/components/runsheet/RunSheetEditor.jsx`, `client/src/components/checkin/AttendanceCounter.jsx`.
  - `client/src/pages/{Analytics,CheckIn,EventCreate,BlockedDates,Templates}.jsx`, `client/src/pages/public/{PublicEventPage,FeedbackForm}.jsx`, `PROGRESS.md`.
- **Decisions and reasons:**
  - Centralized `TYPE_GRADIENTS` / `getEventCoverGradient` in `statusColors.js` to avoid duplicating gradient mappings between discovery cards and public event headers.
- **Issues / blockers:** None.
- **How to test:** `cd client && npm run lint && npm run build` (ESLint passes with 0 errors; Vite production build succeeds in 50.24s).
- **Next steps:** Start the dev servers locally to preview in a browser, or deploy `server/` to Render and `client/` to Vercel.
