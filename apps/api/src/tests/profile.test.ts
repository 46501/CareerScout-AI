import request from 'supertest';
import { app } from '../index';
import { User } from '../models/User';
import { CareerProfile } from '../models/CareerProfile';
import jwt from 'jsonwebtoken';

describe('Profile API Tests', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const user = await User.create({
      fullName: 'Profile Test User',
      email: 'profile@test.com',
      passwordHash: 'hashedpassword',
    });
    userId = user._id.toString();

    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    await CareerProfile.create({ userId: user._id });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await CareerProfile.deleteMany({});
  });

  it('should retrieve an empty profile initially', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.userId.toString()).toBe(userId);
    expect(res.body.data.profileCompletion.percentage).toBe(0);
  });

  it('should allow partial profile updates and calculate completion correctly', async () => {
    const partialUpdate = {
      personal: {
        fullName: 'Profile Test User Updated',
        phone: '1234567890',
        currentCity: 'Testville',
        country: 'Testland'
      }
    };

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(partialUpdate);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.personal.fullName).toBe('Profile Test User Updated');
    // Basic Info should be complete, increasing the percentage
    expect(res.body.data.profileCompletion.percentage).toBeGreaterThan(0);
  });
});
