import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { DevMockProvider } from './providers/DevMockProvider';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

async function startWorker() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
    }

    const mockProvider = new DevMockProvider();
    
    // Seed on startup for local UI development
    await mockProvider.run();

    const worker = new Worker('opportunity-discovery', async job => {
      console.log(`Processing job ${job.id} of type ${job.name}`);
      
      if (job.name === 'dailyOpportunityDiscovery') {
        console.log('Running daily opportunity discovery...');
        await mockProvider.run();
        console.log('Discovery complete.');
      }
    }, { connection: redisConnection });

    worker.on('completed', job => {
      console.log(`Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} has failed with ${err.message}`);
    });

    console.log('Redis connected');
    console.log('Worker started');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();
