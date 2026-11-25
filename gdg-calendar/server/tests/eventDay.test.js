import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
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
    User.deleteMany({}),
  ]);
});

async function createAdminToken() {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await User.create({
    name: 'Admin User',
    email: 'admin@gdg.local',
    passwordHash,
    role: 'admin',
    domain: 'tech',
  });
  return jwt.sign({ id: user._id.toString(), role: user.role, domain: user.domain }, env.jwtSecret, {
    expiresIn: '1d',
  });
}

describe('Phase 4: Public Events, Registration & QR Check-In API', () => {
  it('lists public events, registers a student with QR, and checks them in once', async () => {
    const token = await createAdminToken();

    const evRes = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'DevFest Campus',
        type: 'hackathon',
        startAt: '2026-12-22T09:00:00.000Z',
        endAt: '2026-12-22T18:00:00.000Z',
        status: 'confirmed',
        isPublic: true,
        registrationOpen: true,
        capacity: 100,
      });
    expect(evRes.status).toBe(201);
    const { _id: eventId, slug } = evRes.body.data;

    const pubList = await request(app).get('/api/public/events');
    expect(pubList.status).toBe(200);
    expect(pubList.body.data).toHaveLength(1);

    const regRes = await request(app)
      .post(`/api/public/events/${slug}/register`)
      .send({
        name: 'Aarav Sharma',
        email: 'aarav@college.edu',
        branch: 'CSE',
        year: '3',
      });
    expect(regRes.status).toBe(201);
    expect(regRes.body.data.qrDataUrl).toContain('data:image/png;base64');
    const qrToken = regRes.body.data.registration.qrToken;
    expect(qrToken.length).toBeGreaterThanOrEqual(21);

    const checkInRes = await request(app)
      .post(`/api/events/${eventId}/checkin`)
      .set('Authorization', `Bearer ${token}`)
      .send({ qrToken });
    expect(checkInRes.status).toBe(200);
    expect(checkInRes.body.data.attendance).toEqual({ registered: 1, checkedIn: 1 });

    const dupCheckIn = await request(app)
      .post(`/api/events/${eventId}/checkin`)
      .set('Authorization', `Bearer ${token}`)
      .send({ qrToken });
    expect(dupCheckIn.status).toBe(409);

    const attRes = await request(app)
      .get(`/api/events/${eventId}/attendance`)
      .set('Authorization', `Bearer ${token}`);
    expect(attRes.status).toBe(200);
    expect(attRes.body.data).toEqual({ registered: 1, checkedIn: 1 });
  });
});

