import request from 'supertest';
import { app } from '../index';
import { User } from '../models/User';
import { Opportunity } from '../models/Opportunity';
import { Application } from '../models/Application';
import jwt from 'jsonwebtoken';

describe('Applications API Tests', () => {
  let token: string;
  let opportunityId: string;

  beforeAll(async () => {
    const user = await User.create({
      fullName: 'App Test User',
      email: 'app@test.com',
      passwordHash: 'hashedpassword',
    });

    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    const opp = await Opportunity.create({
      title: 'Test Software Engineer',
      organization: 'Test Org',
      description: 'Test Job',
      sourceId: '12345',
      source: 'Test',
      location: 'Remote',
      type: 'JOB',
      isActive: true,
      remoteType: 'REMOTE',
      lastVerifiedAt: new Date(),
      applicationUrl: 'http://test.com',
      sourceUrl: 'http://test.com',
      postedAt: new Date()
    });
    opportunityId = opp._id.toString();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Application.deleteMany({});
  });

  it('should create an application', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ opportunityId, status: 'APPLIED', notes: 'Testing' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.opportunity.toString()).toBe(opportunityId);
    expect(res.body.data.status).toBe('APPLIED');
  });

  it('should retrieve applications', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('APPLIED');
  });
});
