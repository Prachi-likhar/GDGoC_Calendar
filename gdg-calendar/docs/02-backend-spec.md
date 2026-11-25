# 02: Backend Specification (server/)

## Folder structure
```
server/
├── package.json            # "type": "module"
├── .env.example
└── src/
    ├── server.js           # http server + socket.io bootstrap
    ├── app.js              # express app, middleware, route mounting
    ├── config/             # db.js, env.js, mail.js
    ├── models/             # User, Event, Session, Task, Registration, Template, BlockedDate, Feedback
    ├── routes/             # auth, users, events, sessions, tasks, templates, blockedDates, registrations, feedback, analytics, public
    ├── controllers/
    ├── services/           # conflict.service, template.service, certificate.service, report.service, mail.service
    ├── middleware/         # auth.js, role.js, validate.js, errorHandler.js, rateLimit.js
    ├── validators/         # zod schemas
    ├── jobs/               # reminders.job.js (node-cron)
    ├── sockets/            # index.js (rooms per event)
    ├── utils/              # ApiError.js, asyncHandler.js, qr.js, dates.js
    └── seed/               # seed.js (admin user, default templates)
```

## Dependencies
express, mongoose, zod, jsonwebtoken, bcryptjs, cors, helmet, morgan, express-rate-limit, dotenv, node-cron, nodemailer, socket.io, qrcode, pdfkit, nanoid. Dev: nodemon, vitest (or jest), supertest.

## Middleware rules
- `auth`: verify JWT, attach `req.user = { id, role, domain }`.
- `role(...allowed)`: 403 if `req.user.role` not allowed.
- Ownership check: a `domain_head` may edit an event only if they are `owner` or in `team`.
- `validate(schema)`: Zod validation of body/query/params, respond 422 with field errors.
- `errorHandler`: one place that formats `{ success:false, message, errors? }`.

## Services (business logic)
### conflict.service.js
`findConflicts({ startAt, endAt, excludeId })` returns:
- overlapping events: `startAt < newEnd && endAt > newStart` (ignore `cancelled`)
- overlapping blocked dates
Event create/update returns `409` with `{ warning, clashes }` unless the client sends `?force=true`.

### template.service.js
`generateTasks(event, template)` creates Task docs with `dueDate = event.startAt - offsetDays * 86400000`. Offsets can be negative for post-event tasks (T+1 = -1).

### certificate.service.js
Generate a PDF per checked-in registration using pdfkit: name, event title, date, verification code.

### report.service.js
Post-event report: registrations, attendance, no-show %, branch/year split, average rating, top feedback comments.

## Background jobs
- `reminders.job.js`: daily at 08:00 IST. Email assignees tasks due within 24h or overdue. Email attendees 24h before an event (only for events with `confirmed` status).

## Realtime (Socket.io)
- Client joins room `event:<eventId>`.
- Server emits: `session:updated`, `session:reordered`, `checkin:new` (with updated count), `event:status`.
- Authenticated users and public viewers may join read-only; only organisers may emit via REST (sockets broadcast, REST mutates).

## Security checklist
helmet, CORS limited to `CLIENT_URL`, rate limit `/auth` (10/min), bcrypt cost 10+, JWT expiry, sanitise inputs, never return `passwordHash`, `qrToken` must be unguessable (nanoid 21+).

## Seed script
Creates: one admin (email/password from env), default templates (Workshop, Talk, Hackathon), sample blocked dates.
