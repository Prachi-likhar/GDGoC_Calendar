import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { seedAdmin } from '../src/seed/seed.js';

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
  await User.deleteMany({});
});

async function createUser({
  name = 'Admin User',
  email = 'admin@gdg.local',
  password = 'Password123!',
  role = 'admin',
  domain = 'tech',
  isActive = true,
} = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.create({ name, email, passwordHash, role, domain, isActive });
}

describe('Auth API', () => {
  it('logs in an active user and returns JWT + sanitized user', async () => {
    await createUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gdg.local', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf('string');
    expect(res.body.data.user.email).toBe('admin@gdg.local');
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects invalid credentials with 401', async () => {
    await createUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gdg.local', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns current user on GET /api/auth/me', async () => {
    await createUser();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gdg.local', password: 'Password123!' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.data.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@gdg.local');
    expect(res.body.data.role).toBe('admin');
  });

  it('blocks unauthenticated requests to /api/auth/me with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows admin to register a member and blocks non-admin with 403', async () => {
    await createUser({ email: 'admin@gdg.local', role: 'admin' });
    await createUser({ email: 'member@gdg.local', role: 'member' });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gdg.local', password: 'Password123!' });

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@gdg.local', password: 'Password123!' });

    const forbiddenRes = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${memberLogin.body.data.token}`)
      .send({
        name: 'New Member',
        email: 'new@gdg.local',
        password: 'Password123!',
        domain: 'design',
      });

    expect(forbiddenRes.status).toBe(403);

    const createdRes = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminLogin.body.data.token}`)
      .send({
        name: 'New Member',
        email: 'new@gdg.local',
        password: 'Password123!',
        role: 'domain_head',
        domain: 'design',
      });

    expect(createdRes.status).toBe(201);
    expect(createdRes.body.data.role).toBe('domain_head');
    expect(createdRes.body.data.domain).toBe('design');
  });

  it('seeds admin user idempotently', async () => {
    const first = await seedAdmin();
    const second = await seedAdmin();
    const count = await User.countDocuments({ email: first.email });

    expect(first.role).toBe('admin');
    expect(second._id.toString()).toBe(first._id.toString());
    expect(count).toBe(1);
  });
});
