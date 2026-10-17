import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { RemotiveProvider } from './providers/RemotiveProvider';
import { ArbeitnowProvider } from './providers/ArbeitnowProvider';
import { DevpostProvider } from './providers/DevpostProvider';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

async function startWorker() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      try {
        const mongooseApi = require('../../api/node_modules/mongoose');
        if (mongooseApi && mongoose !== mongooseApi) {
          await mongooseApi.connect(mongoUri);
        }
      } catch (e) {
        console.error('Failed to connect API mongoose in worker:', e);
      }
      console.log('MongoDB connected');
    }

    const remotiveProvider = new RemotiveProvider();
    const arbeitnowProvider = new ArbeitnowProvider();
    const devpostProvider = new DevpostProvider();
    
    const runAllProviders = async () => {
      console.log('Running all opportunity providers (Remotive, Arbeitnow, Devpost)...');
      await Promise.allSettled([
        remotiveProvider.run(),
        arbeitnowProvider.run(),
        devpostProvider.run()
      ]);
    };

    // Seed on startup with real jobs, internships, and hackathons
    await runAllProviders();

    const worker = new Worker('opportunity-discovery', async job => {
      console.log(`Processing job ${job.id} of type ${job.name}`);
      
      if (job.name === 'dailyOpportunityDiscovery') {
        console.log('Running daily opportunity discovery...');
        await runAllProviders();
        console.log('Discovery complete.');
      } else if (job.name === 'personalizedOpportunityDiscovery') {
        console.log(`Running personalized scout for user ${job.data.userId}`);
        const { runPersonalizedScout } = await import('./services/scout.service');
        await runPersonalizedScout(job.data.userId);
        console.log(`Personalized scout complete for user ${job.data.userId}`);
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
