import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { Event } from '../src/models/Event.js';
import { Session } from '../src/models/Session.js';
import { Task } from '../src/models/Task.js';
import { Template } from '../src/models/Template.js';
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
    Task.deleteMany({}),
    Session.deleteMany({}),
    Template.deleteMany({}),
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

describe('Phase 3: Templates, Tasks & Sessions API', () => {
  it('auto-generates dated tasks from a template on event create', async () => {
    const { token } = await createUserAndToken();

    const tplRes = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Workshop',
        eventType: 'workshop',
        tasks: [
          { title: 'Book hall', offsetDays: 7, domain: 'logistics', priority: 'high' },
          { title: 'Send feedback', offsetDays: -1, domain: 'content', priority: 'low' },
        ],
      });
    expect(tplRes.status).toBe(201);

    const eventStart = '2026-12-15T10:00:00.000Z';
    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Flutter Workshop',
        type: 'workshop',
        startAt: eventStart,
        endAt: '2026-12-15T13:00:00.000Z',
        templateId: tplRes.body.data._id,
      });

    expect(evRes.status).toBe(201);
    const tasksRes = await request(app)
      .get(`/api/events/${evRes.body.data._id}/tasks`)
      .set('Authorization', `Bearer ${token}`);

    expect(tasksRes.status).toBe(200);
    expect(tasksRes.body.data).toHaveLength(2);
    expect(new Date(tasksRes.body.data[0].dueDate).toISOString()).toBe('2026-12-08T10:00:00.000Z');
    expect(new Date(tasksRes.body.data[1].dueDate).toISOString()).toBe('2026-12-16T10:00:00.000Z');
  });

  it('allows task assignee to update status only, and lists /tasks/mine', async () => {
    const admin = await createUserAndToken({ email: 'admin@gdg.local', role: 'admin' });
    const member = await createUserAndToken({ email: 'member@gdg.local', role: 'member' });

    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Tech Talk',
        type: 'talk',
        startAt: '2026-12-18T10:00:00.000Z',
        endAt: '2026-12-18T12:00:00.000Z',
      });

    const taskRes = await request(app)
      .post(`/api/events/${evRes.body.data._id}/tasks`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Design poster',
        domain: 'design',
        assignee: member.user._id.toString(),
        dueDate: '2026-12-10T10:00:00.000Z',
      });
    expect(taskRes.status).toBe(201);

    const mineRes = await request(app)
      .get('/api/tasks/mine')
      .set('Authorization', `Bearer ${member.token}`);
    expect(mineRes.status).toBe(200);
    expect(mineRes.body.data).toHaveLength(1);

    const forbiddenTitleEdit = await request(app)
      .patch(`/api/tasks/${taskRes.body.data._id}`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ title: 'Changed by member' });
    expect(forbiddenTitleEdit.status).toBe(403);

    const statusUpdate = await request(app)
      .patch(`/api/tasks/${taskRes.body.data._id}`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ status: 'in_progress' });
    expect(statusUpdate.status).toBe(200);
    expect(statusUpdate.body.data.status).toBe('in_progress');
  });

  it('supports multi-day sessions and reordering', async () => {
    const { token } = await createUserAndToken();

    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '2-Day Hackathon',
        type: 'hackathon',
        startAt: '2026-12-20T09:00:00.000Z',
        endAt: '2026-12-21T18:00:00.000Z',
      });
    const eventId = evRes.body.data._id;

    const s1 = await request(app)
      .post(`/api/events/${eventId}/sessions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        day: 1,
        title: 'Opening Keynote',
        startAt: '2026-12-20T09:00:00.000Z',
        endAt: '2026-12-20T10:00:00.000Z',
      });
    const s2 = await request(app)
      .post(`/api/events/${eventId}/sessions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        day: 1,
        title: 'Team Formation',
        startAt: '2026-12-20T10:00:00.000Z',
        endAt: '2026-12-20T11:00:00.000Z',
      });
    const s3 = await request(app)
      .post(`/api/events/${eventId}/sessions`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        day: 2,
        title: 'Demo Day',
        startAt: '2026-12-21T14:00:00.000Z',
        endAt: '2026-12-21T17:00:00.000Z',
      });

    expect(s1.status).toBe(201);
    expect(s2.status).toBe(201);
    expect(s3.status).toBe(201);

    const reorderRes = await request(app)
      .patch(`/api/events/${eventId}/sessions/reorder`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          { id: s2.body.data._id, day: 1, order: 0 },
          { id: s1.body.data._id, day: 1, order: 1 },
        ],
      });

    expect(reorderRes.status).toBe(200);
    const day1 = reorderRes.body.data.filter((s) => s.day === 1);
    expect(day1[0].title).toBe('Team Formation');
    expect(day1[1].title).toBe('Opening Keynote');
  });
});

