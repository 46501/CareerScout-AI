import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { z } from 'zod';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error?.issues?.[0]?.message || 'Invalid input' });
    }
    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is missing');

    const token = jwt.encode({ id: user._id }, secret);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, profileCompleted: user.profileCompleted, completionPercentage: user.completionPercentage } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Something went wrong during registration. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error?.issues?.[0]?.message || 'Invalid input' });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is missing');

    const token = jwt.encode({ id: user._id }, secret);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, profileCompleted: user.profileCompleted, completionPercentage: user.completionPercentage } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong during login. Please try again.' });
  }
});

router.get('/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Fetch me error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

router.put('/password', authMiddleware, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
