import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

async function startWorker() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('Worker connected to MongoDB');
    }

    const worker = new Worker('opportunity-discovery', async job => {
      console.log(`Processing job ${job.id} of type ${job.name}`);
      
      if (job.name === 'dailyOpportunityDiscovery') {
        console.log('Running daily opportunity discovery...');
        // 1. Fetch from providers
        // 2. Normalize and Deduplicate
        // 3. Analyze and match
        // 4. Store in DB
        console.log('Discovery complete.');
      }
    }, { connection: redisConnection });

    worker.on('completed', job => {
      console.log(`Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} has failed with ${err.message}`);
    });

    console.log('Worker started successfully');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();
