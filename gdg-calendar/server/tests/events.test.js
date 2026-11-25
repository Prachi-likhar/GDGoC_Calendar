import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { BlockedDate } from '../src/models/BlockedDate.js';
import { Event } from '../src/models/Event.js';
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
    BlockedDate.deleteMany({}),
    User.deleteMany({}),
  ]);
});

async function createUserAndToken({
  email = 'admin@gdg.local',
  role = 'admin',
  domain = 'tech',
} = {}) {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await User.create({
    name: `${role} User`,
    email,
    passwordHash,
    role,
    domain,
  });
  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, domain: user.domain },
    env.jwtSecret,
    { expiresIn: '1d' }
  );
  return { user, token };
}

describe('Events, Conflict Service & BlockedDates API', () => {
  it('creates, lists, updates, duplicates, and deletes an event', async () => {
    const { token } = await createUserAndToken();

    const createRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Cloud Study Jam',
        type: 'study_jam',
        venue: 'Auditorium',
        startAt: '2026-12-01T10:00:00.000Z',
        endAt: '2026-12-01T13:00:00.000Z',
        status: 'planned',
      });

    expect(createRes.status).toBe(201);
    const eventId = createRes.body.data._id;
    expect(createRes.body.data.slug).toContain('cloud-study-jam');

    const listRes = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toHaveLength(1);

    const patchRes = await request(app)
      .patch(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'confirmed' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe('confirmed');

    const dupRes = await request(app)
      .post(`/api/events/${eventId}/duplicate`)
      .set('Authorization', `Bearer ${token}`);
    expect(dupRes.status).toBe(201);
    expect(dupRes.body.data.title).toBe('Cloud Study Jam (Copy)');
    expect(dupRes.body.data.status).toBe('idea');

    const delRes = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);
  });

  it('returns 409 warning on overlapping event or blocked date unless ?force=true', async () => {
    const { token } = await createUserAndToken();

    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Build with AI',
        type: 'workshop',
        startAt: '2026-12-05T09:00:00.000Z',
        endAt: '2026-12-05T12:00:00.000Z',
        status: 'confirmed',
      });

    await BlockedDate.create({
      title: 'Semester Exams',
      startDate: '2026-12-10T00:00:00.000Z',
      endDate: '2026-12-12T23:59:59.000Z',
      reason: 'exam',
    });

    const clashRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Overlapping Talk',
        type: 'talk',
        startAt: '2026-12-05T11:00:00.000Z',
        endAt: '2026-12-05T14:00:00.000Z',
      });

    expect(clashRes.status).toBe(409);
    expect(clashRes.body.clashes.events).toHaveLength(1);
    expect(clashRes.body.warning).toBeDefined();

    const blockedClashRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Exam Day Meetup',
        type: 'meetup',
        startAt: '2026-12-11T10:00:00.000Z',
        endAt: '2026-12-11T12:00:00.000Z',
      });

    expect(blockedClashRes.status).toBe(409);
    expect(blockedClashRes.body.clashes.blockedDates).toHaveLength(1);

    const forceRes = await request(app)
      .post('/api/events?force=true')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Overlapping Talk',
        type: 'talk',
        startAt: '2026-12-05T11:00:00.000Z',
        endAt: '2026-12-05T14:00:00.000Z',
      });

    expect(forceRes.status).toBe(201);
  });

  it('ignores cancelled events in conflict detection and enforces domain_head ownership', async () => {
    const admin = await createUserAndToken({ email: 'admin@gdg.local', role: 'admin' });
    const headA = await createUserAndToken({ email: 'heada@gdg.local', role: 'domain_head' });
    const headB = await createUserAndToken({ email: 'headb@gdg.local', role: 'domain_head' });

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${headA.token}`)
      .send({
        title: 'Cancelled Event',
        type: 'talk',
        startAt: '2026-12-20T10:00:00.000Z',
        endAt: '2026-12-20T12:00:00.000Z',
        status: 'cancelled',
      });

    const forbiddenEdit = await request(app)
      .patch(`/api/events/${created.body.data._id}`)
      .set('Authorization', `Bearer ${headB.token}`)
      .send({ title: 'Hijacked' });
    expect(forbiddenEdit.status).toBe(403);

    const noClash = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Replacement Event',
        type: 'workshop',
        startAt: '2026-12-20T10:00:00.000Z',
        endAt: '2026-12-20T12:00:00.000Z',
      });
    expect(noClash.status).toBe(201);
  });

  it('allows admin to CRUD blocked dates and rejects non-admin', async () => {
    const admin = await createUserAndToken({ email: 'admin@gdg.local', role: 'admin' });
    const member = await createUserAndToken({ email: 'member@gdg.local', role: 'member' });

    const forbidden = await request(app)
      .post('/api/blocked-dates')
      .set('Authorization', `Bearer ${member.token}`)
      .send({
        title: 'Holiday',
        startDate: '2026-12-25',
        endDate: '2026-12-25',
        reason: 'holiday',
      });
    expect(forbidden.status).toBe(403);

    const created = await request(app)
      .post('/api/blocked-dates')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Winter Break',
        startDate: '2026-12-25T00:00:00.000Z',
        endDate: '2026-12-26T23:59:59.000Z',
        reason: 'holiday',
      });
    expect(created.status).toBe(201);

    const list = await request(app)
      .get('/api/blocked-dates')
      .set('Authorization', `Bearer ${member.token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const del = await request(app)
      .delete(`/api/blocked-dates/${created.body.data._id}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(del.status).toBe(200);
  });
});

