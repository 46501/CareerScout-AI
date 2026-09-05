import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import opportunityRoutes from './routes/opportunity.routes';
import resumeRoutes from './routes/resume.routes';
import agentRoutes from './routes/agent.routes';
import profileRoutes from './routes/profile.routes';
import applicationRoutes from './routes/application.routes';
import userRoutes from './routes/user.routes';
import { startScheduler } from './jobs/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/user', userRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong. Please try again later.' });
});

// Database Connection
if (!process.env.MONGODB_URI || process.env.MONGODB_URI.trim() === '') {
  console.error('\n======================================================');
  console.error('ERROR: MONGODB_URI is not configured in .env file.');
  console.error('Please configure your MongoDB Atlas connection string.');
  console.error('======================================================\n');
  process.exit(1);
}
// Disable Mongoose buffering — operations fail immediately if DB is disconnected
// instead of hanging for 10s (bufferTimeoutMS default), which was causing Axios timeouts
mongoose.set('bufferCommands', false);

// Start the HTTP server immediately so it's always responsive
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB in the background with retry
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI!, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000,
        bufferCommands: false,
      });
      console.log('Successfully connected to MongoDB Atlas');
      startScheduler();
      return;
    } catch (error: any) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  console.error('All MongoDB connection attempts failed. Server is running but DB-dependent routes will return errors.');
};

connectWithRetry();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server gracefully...');
  try { await mongoose.connection.close(); } catch {}
  server.close(() => {
    console.log('Server and MongoDB connection closed.');
    process.exit(0);
  });
});
// Trigger restart
