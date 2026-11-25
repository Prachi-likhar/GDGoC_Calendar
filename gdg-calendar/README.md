# GDG Event Calendar

A web app for our college GDG community to plan events, track day-wise timelines, manage team tasks, run events live (QR check-in, live run sheet), and review analytics afterwards.

> **For the AI agent (Antigravity):** read `AGENTS.md` first, then `docs/` in order. After every piece of work you must update `PROGRESS.md` and, when conventions change, `SKILLS.md` and this README.

## Tech stack
| Layer | Choice |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, FullCalendar, Axios, socket.io-client |
| Backend | Node.js, Express, Mongoose, Zod, JWT, node-cron, Nodemailer, Socket.io |
| Database | MongoDB Atlas |
| Extras | `qrcode`, `html5-qrcode`, `pdfkit` (certificates) |
| Hosting | Vercel (client), Render (server) |

## Repository layout
```
gdg-calendar/
├── README.md
├── AGENTS.md          # rules the agent must follow
├── SKILLS.md          # living list of skills, conventions, patterns used
├── PROGRESS.md        # running log of everything done (append only)
├── docs/              # specs (read in order)
├── server/            # Express API
└── client/            # React app
```

## Features
- Master calendar (month / week / list) with status colours (implemented in Phase 2)
- Conflict detector (event overlaps and blocked dates with 409 warning and `?force=true`, implemented in Phase 2)
- Event create/edit/detail/duplicate and admin blocked dates management (implemented in Phase 2)
- Event templates that auto-generate a T-30 to T+7 task checklist (implemented in Phase 3)
- Multi-day run sheets (Day 1, Day 2 ...) per event (implemented in Phase 3)
- Task board per event, role-based access (implemented in Phase 3)
- Public event page, registration, QR check-in, live counter (implemented in Phase 4)
- Email reminders, feedback form, certificates (implemented in Phase 5)
- Analytics dashboard and post-event report (implemented in Phase 5)

## Setup (update as the project evolves)
```bash
# server
cd server && cp .env.example .env && npm install && npm run seed && npm run dev
# client
cd client && cp .env.example .env && npm install && npm run dev
```

### Scripts
- `server`: `npm run dev`, `npm start`, `npm run seed`, `npm test`, `npm run lint`
- `client`: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`

### Environment variables
`server/.env`
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/gdg-calendar
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=GDG Lead
ADMIN_EMAIL=admin@gdg.local
ADMIN_PASSWORD=ChangeMe123!
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```
`client/.env`
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Deployment

### Live URLs
- Client (Vercel): `<update after deploying>`
- Server (Render): `<update after deploying>`

### Render (Backend `server/`)
1. Create a **Web Service** connected to your repository with **Root Directory** set to `gdg-calendar/server`.
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Set environment variables: `NODE_ENV=production`, `PORT=5000`, `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL` (your Vercel URL), `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `SMTP_*`.
5. Run `npm run seed` once via Render Shell to seed the admin user, default templates, and sample blocked dates.

### Vercel (Frontend `client/`)
1. Import the repository with **Root Directory** set to `gdg-calendar/client`.
2. **Build Command:** `npm run build` | **Output Directory:** `dist` (SPA rewrites are configured in `client/vercel.json`).
3. Set environment variables: `VITE_API_URL=https://<your-render-app>.onrender.com/api` and `VITE_SOCKET_URL=https://<your-render-app>.onrender.com`.

## Status
See `PROGRESS.md` for what is done and what is next.
