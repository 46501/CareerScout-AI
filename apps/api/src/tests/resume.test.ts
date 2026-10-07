import request from 'supertest';
import { app } from '../index';
import { User } from '../models/User';
import { Resume } from '../models/Resume';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

describe('Resume API Regression Tests', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      fullName: 'Test User',
      email: 'resume@test.com',
      passwordHash: 'hashedpassword',
    });
    userId = user._id.toString();

    // Create JWT
    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Resume.deleteMany({});
  });

  it('should handle invalid/dummy PDF without crashing and reach FAILED state if extraction fails', async () => {
    // Create dummy pdf
    const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(dummyPdfPath, 'not a real pdf content');

    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', dummyPdfPath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Give asynchronous processing a tiny bit of time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check DB status
    const resume = await Resume.findOne({ userId });
    expect(resume).toBeDefined();
    // Because it's not a valid PDF, pdf-parse will throw, and the worker/catch block will mark it FAILED
    expect(resume?.status).toBe('FAILED');

    // Cleanup
    fs.unlinkSync(dummyPdfPath);
  });
});
