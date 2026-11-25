# SKILLS.md: living skills and conventions file

The agent keeps this file up to date. Add a line whenever a new skill, library, or pattern is used. Do not remove entries; mark them deprecated instead.

## Skills required for this project
| Area | Skill / Library | Used for | Status |
|---|---|---|---|
| Frontend | React 18 + Vite | SPA | in-use |
| Frontend | Tailwind CSS | styling | in-use |
| Frontend | React Router | routing and protected routes | in-use |
| Frontend | FullCalendar | calendar views | in-use |
| Frontend | date-fns + date-fns-tz | UTC to IST date formatting | in-use |
| Frontend | Axios | API client with token interceptor | in-use |
| Frontend | react-hook-form + @hookform/resolvers | form state and Zod validation | in-use |
| Frontend | lucide-react | UI icons | in-use |
| Frontend | socket.io-client | live run sheet and check-in counter | in-use |
| Frontend | html5-qrcode | QR scanner | in-use |
| Backend | Express | REST API | in-use |
| Backend | Mongoose | MongoDB models | in-use |
| Backend | Zod | request validation | in-use |
| Backend | JWT + bcryptjs | authentication | in-use |
| Backend | RBAC middleware | role checks | in-use |
| Backend | helmet + cors + express-rate-limit | HTTP security and `/api/auth` rate limiting | in-use |
| Backend | Vitest + Supertest + mongodb-memory-server | API and service integration tests | in-use |
| Backend | node-cron + Nodemailer | scheduled reminder emails | in-use |
| Backend | Socket.io | realtime events | in-use |
| Backend | qrcode | QR token images | in-use |
| Backend | pdfkit | certificates and reports | in-use |
| Frontend | recharts | analytics charts | in-use |
| DevOps | Vercel, Render, MongoDB Atlas | deployment | planned |

## Reusable patterns (fill in as built)
- **Conflict detection:** overlap query `startAt < newEnd && endAt > newStart` (ignoring `cancelled` events and checking `BlockedDate` ranges; see `server/src/services/conflict.service.js`)
- **UTC to IST dates:** store UTC in MongoDB, convert via `date-fns-tz` (`Asia/Kolkata`) on the client (see `client/src/utils/dates.js`)
- **Template to tasks:** `dueDate = event.startAt - offsetDays * 86400000` (see `server/src/services/template.service.js`)
- **Error shape:** `{ success:false, message, errors? }` (handled by `server/src/utils/ApiError.js` + `server/src/middleware/errorHandler.js`)
- **Success shape:** `{ success:true, data }`
- **Request validation:** `validate(zodSchema)` middleware returning 422 with `{ field, message }` items (see `server/src/middleware/validate.js`)
- **Auth & RBAC:** `auth` attaches `req.user = { id, role, domain }` after checking `isActive`; `role(...allowed)` enforces 403 (see `server/src/middleware/auth.js` and `role.js`)
- **Client API & 401 handling:** `apiClient` attaches `Authorization: Bearer <token>` and redirects to `/login` on 401 (see `client/src/api/client.js`)
- **Theming & Dark Mode:** `ThemeProvider` + `useTheme` manage `.dark` class and CSS variables (`--bg-canvas`, `--bg-surface`, `--bg-subtle`, `--border-subtle`, `--text-primary`) with `localStorage` persistence and system preference fallback (see `client/src/context/ThemeContext.jsx` and `docs/07_DESIGN_SYSTEM.md`)
- **Toast Notifications:** `ToastProvider` + `useToast().showToast(message, type)` for action feedback (see `client/src/context/ToastContext.jsx`)
- **Mobile Navigation:** `MobileBottomNav` floating rounded 5-item bar with `44px+` touch targets and safe-area inset padding (see `client/src/components/layout/MobileBottomNav.jsx`)

## Conventions
- Naming: camelCase in JS, kebab-case for files in `client/src/pages`, PascalCase for components.
- API prefix: `/api`. Plural resource names. Status codes: 200, 201, 400, 401, 403, 404, 409, 422.
- Roles: `admin`, `domain_head`, `member`.
- Domains: `tech`, `design`, `pr`, `content`, `logistics`, `outreach`.

## Change log for this file
- 2026-11-25: Phase 1 Foundation — marked core frontend/backend libraries as `in-use`, added `react-hook-form`, `lucide-react`, `helmet/cors/express-rate-limit`, `vitest/supertest/mongodb-memory-server`, and documented validation, auth/RBAC, and Axios interceptor patterns.
- 2026-11-25: Phase 2 Events and Calendar — marked `FullCalendar` as `in-use`, added `date-fns` + `date-fns-tz`, and documented UTC-to-IST conversion and conflict detection patterns.
- 2026-11-25: Phase 3 Planning tools — added `Template`, `Task`, `Session` models/services, `TaskBoard`, `RunSheetEditor`, `MyTasks`, and `Templates` pages.
- 2026-11-25: Phase 4 Public and event-day — marked `socket.io`, `socket.io-client`, `qrcode`, and `html5-qrcode` as `in-use`; added Socket.io event rooms, public registration, and QR check-in.
- 2026-11-25: Phase 5 Automation and insights — marked `node-cron + Nodemailer` and `pdfkit` as `in-use`; added `recharts` analytics, feedback, certificates ZIP, and post-event reports.
- 2026-11-25: Phase 6 Polish and deploy — added `Team` admin management page, Vite `manualChunks`, `client/vercel.json` SPA rewrites, and Render/Vercel deployment docs.
- 2026-11-25: UI/UX Transformation — added `docs/07_DESIGN_SYSTEM.md`, `ThemeProvider`, `ToastProvider`, `BracketMark`, 4-colour `Loader`/`Skeleton`, `ConfettiBurst`, `MobileBottomNav`, `EventCard`, `Profile`, upgraded `Dashboard`, `CalendarPage`, `PublicEvents`, `EventDetail`, `TaskBoard`, `MyTasks`, and `Team`.
