# 04: REST API Specification

Base URL: `/api`. Responses: `{ success:true, data }` or `{ success:false, message, errors? }`.
Auth: `Authorization: Bearer <token>`. Roles: A = admin, H = domain_head, M = member.

## Auth
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /auth/login | public | email + password, returns token + user |
| GET | /auth/me | any | current user |
| POST | /auth/register | A | create a team member |
| PATCH | /auth/password | any | change own password |

## Users
| GET | /users | A, H | list team |
| PATCH | /users/:id | A | role, domain, active |

## Events
| GET | /events?from&to&status&type | any | calendar data |
| POST | /events?force=true | A, H | create, runs conflict check, optional `templateId` auto-generates tasks |
| GET | /events/:id | any | detail with sessions and task summary |
| PATCH | /events/:id | A, owner | update, conflict check |
| DELETE | /events/:id | A | delete event and children |
| POST | /events/:id/duplicate | A, H | copy event, sessions, tasks |
| GET | /events/conflicts?startAt&endAt | A, H | preview clashes |

## Sessions (run sheet)
| GET | /events/:id/sessions | any | grouped by day |
| POST | /events/:id/sessions | A, owner | add |
| PATCH | /sessions/:id | A, owner | edit, emits socket `session:updated` |
| PATCH | /events/:id/sessions/reorder | A, owner | `[{id, day, order}]` |
| DELETE | /sessions/:id | A, owner | remove |

## Tasks
| GET | /events/:id/tasks | any | board data |
| GET | /tasks/mine | any | tasks assigned to me |
| POST | /events/:id/tasks | A, owner | create |
| PATCH | /tasks/:id | A, owner, assignee | assignee can change only `status` |
| DELETE | /tasks/:id | A, owner | |

## Templates and blocked dates
| GET/POST/PATCH/DELETE | /templates | A (GET any team) | CRUD |
| GET/POST/DELETE | /blocked-dates | A (GET any team) | CRUD |

## Registrations and check-in
| POST | /public/events/:slug/register | public | create registration, returns QR (data URL) and sends email |
| GET | /events/:id/registrations | A, owner | list and export CSV (`?format=csv`) |
| POST | /events/:id/checkin | A, H | body `{ qrToken }`, sets `checkedInAt`, emits `checkin:new`; 409 if already checked in |
| GET | /events/:id/attendance | A, H | `{ registered, checkedIn }` |

## Public
| GET | /public/events | public | upcoming `isPublic` events |
| GET | /public/events/:slug | public | event page data and run sheet |

## Feedback, certificates, analytics
| POST | /public/events/:slug/feedback | public (needs qrToken) | submit |
| GET | /events/:id/feedback | A, owner | list and summary |
| GET | /events/:id/certificates.zip | A, owner | certificates for checked-in attendees |
| GET | /public/certificates/:qrToken | public | single certificate PDF |
| GET | /analytics/overview | A, H | totals, trends over time, per-type stats |
| GET | /events/:id/report | A, owner | post-event report JSON (and `?format=pdf`) |
