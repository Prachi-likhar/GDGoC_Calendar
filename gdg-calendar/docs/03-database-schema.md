# 03: Database Schema (MongoDB / Mongoose)

All schemas use `timestamps: true`.

## User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | unique, lowercase |
| passwordHash | String | select:false |
| role | enum | admin, domain_head, member (default member) |
| domain | enum | tech, design, pr, content, logistics, outreach |
| isActive | Boolean | default true |

## Event
| Field | Type | Notes |
|---|---|---|
| title | String | required |
| type | enum | workshop, talk, hackathon, study_jam, series, meetup, other |
| description | String | |
| venue | String | physical place or meeting link |
| startAt, endAt | Date | UTC, endAt > startAt |
| status | enum | idea, planned, confirmed, ongoing, done, cancelled |
| owner | ObjectId(User) | |
| team | [ObjectId(User)] | |
| posterUrl | String | |
| isPublic | Boolean | shown on public page |
| registrationOpen | Boolean | |
| capacity | Number | optional |
| templateId | ObjectId(Template) | optional |
| slug | String | unique, for public URL |
Indexes: `{ startAt:1, endAt:1 }`, `{ slug:1 }`.

## Session (run sheet item)
| Field | Type | Notes |
|---|---|---|
| eventId | ObjectId(Event) | |
| day | Number | 1, 2, 3 ... for multi-day events |
| title | String | |
| speaker | String | |
| startAt, endAt | Date | |
| order | Number | sort within a day |
| notes | String | |
| assignee | ObjectId(User) | volunteer in charge |
| status | enum | upcoming, live, done |

## Task
| Field | Type | Notes |
|---|---|---|
| eventId | ObjectId(Event) | |
| title | String | |
| domain | enum | same as User.domain |
| assignee | ObjectId(User) | |
| dueDate | Date | |
| status | enum | todo, in_progress, done |
| priority | enum | low, medium, high |

## Template
| Field | Type | Notes |
|---|---|---|
| name | String | e.g. "Workshop" |
| eventType | String | |
| tasks | [{ title, offsetDays, domain, priority }] | offsetDays = days before event (negative = after) |
| defaultSessions | [{ title, offsetMinutes, durationMinutes }] | optional |

## BlockedDate
`title, startDate, endDate, reason (exam, holiday, college_event)`

## Registration
| Field | Type | Notes |
|---|---|---|
| eventId | ObjectId(Event) | |
| name, email, phone | String | |
| branch, year | String / Number | |
| qrToken | String | unique, nanoid |
| checkedInAt | Date | null until scanned |
| certificateIssued | Boolean | |
Unique index: `{ eventId:1, email:1 }`.

## Feedback
`eventId, registrationId, rating (1-5), liked, improve, comments`. One per registration.
