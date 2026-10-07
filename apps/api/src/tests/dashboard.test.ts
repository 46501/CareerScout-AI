import request from 'supertest';
import { app } from '../index';
import { User } from '../models/User';
import { Opportunity } from '../models/Opportunity';
import { Application } from '../models/Application';
import { SavedOpportunity } from '../models/SavedOpportunity';
import jwt from 'jsonwebtoken';

describe('Dashboard API Tests', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const user = await User.create({
      fullName: 'Dash Test User',
      email: 'dash@test.com',
      passwordHash: 'hashedpassword',
    });
    userId = user._id.toString();

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

    await Application.create({
      user: userId,
      opportunity: opp._id,
      status: 'APPLIED',
    });

    await SavedOpportunity.create({
      user: userId,
      opportunity: opp._id,
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Opportunity.deleteMany({});
    await Application.deleteMany({});
    await SavedOpportunity.deleteMany({});
  });

  it('should retrieve dashboard stats accurately', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applied).toBe(1);
    expect(res.body.data.saved).toBe(1);
    expect(res.body.data.interviews).toBe(0);
  });
});
