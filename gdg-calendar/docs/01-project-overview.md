# 01: Project Overview

## Goal
One place for our college GDG chapter to plan every event, track its timeline (including day-by-day schedules), assign work to the team, run the event live, and learn from the results.

## Users and roles
| Role | Can do |
|---|---|
| `admin` (lead) | Everything: users, templates, blocked dates, all events, analytics |
| `domain_head` | Create/edit events they own, manage tasks of their domain, run check-in |
| `member` | View calendar, see assigned tasks, update own task status |
| `public` (no login) | View published events, register, get QR, submit feedback |

## Core user stories
1. As a lead I create an event from a template and the checklist (T-30 ... T+7) is generated automatically.
2. As a lead I am warned if the event clashes with another event or a blocked date (exams/holidays).
3. As an organiser I build a run sheet per day with sessions, speakers, and times.
4. As a team member I see my tasks and due dates and move them To do / In progress / Done.
5. As a student I open the public page, register, and receive a QR code.
6. As a volunteer I scan QR codes on event day and see the live attendance counter.
7. As a lead I see analytics (registrations vs attendance, ratings) and download certificates and a report.

## Non-goals (for v1)
Payments, native mobile app, WhatsApp bot (optional later).

## Event statuses
`idea -> planned -> confirmed -> ongoing -> done` (plus `cancelled`)

## Event types
`workshop`, `talk`, `hackathon`, `study_jam`, `series`, `meetup`, `other`
