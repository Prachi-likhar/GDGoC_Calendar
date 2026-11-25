import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { BlockedDate } from '../models/BlockedDate.js';
import { Template } from '../models/Template.js';
import { User } from '../models/User.js';

export async function seedAdmin() {
  const email = env.adminEmail.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  const admin = await User.create({
    name: env.adminName,
    email,
    passwordHash,
    role: 'admin',
    domain: 'tech',
    isActive: true,
  });

  console.log(`Seeded admin user: ${admin.email}`);
  return admin;
}

export async function seedBlockedDates() {
  const count = await BlockedDate.countDocuments();
  if (count > 0) {
    console.log(`Blocked dates already seeded (${count})`);
    return [];
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const samples = [
    {
      title: 'Mid-Semester Exams',
      startDate: new Date(Date.UTC(year, now.getUTCMonth(), 15, 0, 0, 0)),
      endDate: new Date(Date.UTC(year, now.getUTCMonth(), 20, 23, 59, 59)),
      reason: 'exam',
    },
    {
      title: 'Annual College Fest',
      startDate: new Date(Date.UTC(year, now.getUTCMonth() + 1, 5, 0, 0, 0)),
      endDate: new Date(Date.UTC(year, now.getUTCMonth() + 1, 7, 23, 59, 59)),
      reason: 'college_event',
    },
  ];

  const created = await BlockedDate.insertMany(samples);
  console.log(`Seeded ${created.length} sample blocked dates`);
  return created;
}

export async function seedTemplates() {
  const count = await Template.countDocuments();
  if (count > 0) {
    console.log(`Templates already seeded (${count})`);
    return [];
  }

  const defaults = [
    {
      name: 'Workshop',
      eventType: 'workshop',
      tasks: [
        { title: 'Confirm speaker & topic outline', offsetDays: 21, domain: 'tech', priority: 'high' },
        { title: 'Design event poster & social assets', offsetDays: 14, domain: 'design', priority: 'medium' },
        { title: 'Open registration & publish announcement', offsetDays: 10, domain: 'pr', priority: 'high' },
        { title: 'Book auditorium & verify AV/Wi-Fi', offsetDays: 5, domain: 'logistics', priority: 'high' },
        { title: 'Send T-1 reminder email to attendees', offsetDays: 1, domain: 'outreach', priority: 'medium' },
        { title: 'Publish recap & issue certificates', offsetDays: -2, domain: 'content', priority: 'medium' },
      ],
      defaultSessions: [
        { title: 'Check-in & Welcome', offsetMinutes: 0, durationMinutes: 20 },
        { title: 'Hands-on Workshop Session', offsetMinutes: 20, durationMinutes: 90 },
        { title: 'Q&A & Wrap-up', offsetMinutes: 110, durationMinutes: 15 },
      ],
    },
    {
      name: 'Talk',
      eventType: 'talk',
      tasks: [
        { title: 'Invite & confirm speaker', offsetDays: 14, domain: 'outreach', priority: 'high' },
        { title: 'Create promotional banner', offsetDays: 10, domain: 'design', priority: 'medium' },
        { title: 'Share event across campus channels', offsetDays: 7, domain: 'pr', priority: 'medium' },
        { title: 'Send feedback form & thank-you note', offsetDays: -1, domain: 'content', priority: 'low' },
      ],
      defaultSessions: [
        { title: 'Intro & Speaker Welcome', offsetMinutes: 0, durationMinutes: 10 },
        { title: 'Keynote Talk', offsetMinutes: 10, durationMinutes: 45 },
        { title: 'Audience Q&A', offsetMinutes: 55, durationMinutes: 15 },
      ],
    },
    {
      name: 'Hackathon',
      eventType: 'hackathon',
      tasks: [
        { title: 'Finalize problem statements & rubric', offsetDays: 30, domain: 'tech', priority: 'high' },
        { title: 'Confirm judges & mentors', offsetDays: 21, domain: 'outreach', priority: 'high' },
        { title: 'Arrange venue, power & meals', offsetDays: 10, domain: 'logistics', priority: 'high' },
        { title: 'Publish winners & post-event report', offsetDays: -3, domain: 'content', priority: 'medium' },
      ],
      defaultSessions: [
        { title: 'Opening Ceremony & Rules', offsetMinutes: 0, durationMinutes: 45 },
        { title: 'Hacking Begins', offsetMinutes: 45, durationMinutes: 240 },
      ],
    },
  ];

  const created = await Template.insertMany(defaults);
  console.log(`Seeded ${created.length} default templates`);
  return created;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  connectDB()
    .then(async () => {
      await seedAdmin();
      await seedBlockedDates();
      await seedTemplates();
    })
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

