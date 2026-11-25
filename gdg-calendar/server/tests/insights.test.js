import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { runRemindersTick } from '../src/jobs/reminders.job.js';
import { Event } from '../src/models/Event.js';
import { Feedback } from '../src/models/Feedback.js';
import { Registration } from '../src/models/Registration.js';
import { Task } from '../src/models/Task.js';
import { User } from '../src/models/User.js';

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
  await mongoose.connect(mongoServer.getUri());
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await Promise.all([
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Feedback.deleteMany({}),
    Task.deleteMany({}),
    User.deleteMany({}),
  ]);
});

async function createAdmin() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@gdg.local',
    passwordHash,
    role: 'admin',
    domain: 'tech',
  });
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, domain: user.domain },
    env.jwtSecret,
    { expiresIn: '1d' }
  );
  return { user, token };
}

describe('Phase 5: Feedback, Certificates, Reports, Analytics & Reminders', () => {
  it('stores feedback, generates single & zip certificates, report, analytics, and reminders', async () => {
    const { user, token } = await createAdmin();

    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Cloud Summit',
        type: 'talk',
        startAt: new Date(Date.now() + 3600000).toISOString(),
        endAt: new Date(Date.now() + 7200000).toISOString(),
        status: 'confirmed',
        isPublic: true,
        registrationOpen: true,
      });
    const { _id: eventId, slug } = evRes.body.data;

    const regRes = await request(app)
      .post(`/api/public/events/${slug}/register`)
      .send({ name: 'Riya Patel', email: 'riya@college.edu', branch: 'IT', year: '2' });
    const qrToken = regRes.body.data.registration.qrToken;

    await request(app)
      .post(`/api/events/${eventId}/checkin`)
      .set('Authorization', `Bearer ${token}`)
      .send({ qrToken });

    const fbRes = await request(app)
      .post(`/api/public/events/${slug}/feedback`)
      .send({ qrToken, rating: 5, liked: 'Great speaker', comments: 'Loved it!' });
    expect(fbRes.status).toBe(201);

    const dupFb = await request(app)
      .post(`/api/public/events/${slug}/feedback`)
      .send({ qrToken, rating: 4 });
    expect(dupFb.status).toBe(409);

    const certRes = await request(app).get(`/api/public/certificates/${qrToken}`);
    expect(certRes.status).toBe(200);
    expect(certRes.headers['content-type']).toContain('application/pdf');

    const reportRes = await request(app)
      .get(`/api/events/${eventId}/report`)
      .set('Authorization', `Bearer ${token}`);
    expect(reportRes.status).toBe(200);
    expect(reportRes.body.data.checkedIn).toBe(1);
    expect(reportRes.body.data.averageRating).toBe(5);

    const overviewRes = await request(app)
      .get('/api/analytics/overview')
      .set('Authorization', `Bearer ${token}`);
    expect(overviewRes.status).toBe(200);
    expect(overviewRes.body.data.totals.events).toBe(1);
    expect(overviewRes.body.data.totals.checkedIn).toBe(1);

    await Task.create({
      eventId,
      title: 'Prepare slides',
      domain: 'tech',
      assignee: user._id,
      dueDate: new Date(Date.now() + 3600000),
    });

    const reminderCounts = await runRemindersTick();
    expect(reminderCounts.taskEmails).toBe(1);
    expect(reminderCounts.attendeeEmails).toBe(1);
  });
});

