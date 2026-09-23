import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import resumeRoutes from './routes/resume.routes';
import opportunityRoutes from './routes/opportunity.routes';
import savedOpportunityRoutes from './routes/savedOpportunity.routes';
import applicationRoutes from './routes/application.routes';
import notificationRoutes from './routes/notification.routes';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static path for uploads
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/saved', savedOpportunityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'CareerScout API is healthy' });
});

async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
