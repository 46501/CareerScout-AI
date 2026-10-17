import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { RemotiveProvider } from './providers/RemotiveProvider';
import { ArbeitnowProvider } from './providers/ArbeitnowProvider';
import { DevpostProvider } from './providers/DevpostProvider';
import { DevfolioProvider } from './providers/DevfolioProvider';
import { revalidateOpportunityFreshness } from './services/freshness.service';

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
      console.log('[Worker] MongoDB connected');
    }

    const remotiveProvider = new RemotiveProvider();
    const arbeitnowProvider = new ArbeitnowProvider();
    const devpostProvider = new DevpostProvider();
    const devfolioProvider = new DevfolioProvider();
    
    const runAllProviders = async () => {
      console.log('[Worker] Running all opportunity providers (Remotive, Arbeitnow, Devpost, Devfolio)...');
      const results = await Promise.allSettled([
        remotiveProvider.run(),
        arbeitnowProvider.run(),
        devpostProvider.run(),
        devfolioProvider.run()
      ]);

      console.log('[Worker] Providers execution settled. Running freshness revalidation...');
      try {
        await revalidateOpportunityFreshness();
      } catch (freshnessErr) {
        console.error('[Worker] Error running freshness revalidation:', freshnessErr);
      }
      return results;
    };

    // Seed on startup with real jobs, internships, hackathons, and competitions
    console.log('[Worker] Running initial ingestion sync on startup...');
    await runAllProviders();

    // Setup 2-hour scheduled recurring ingestion via BullMQ Queue
    const discoveryQueue = new Queue('opportunity-discovery', { connection: redisConnection });
    
    // Clear any stale repeating jobs and schedule 2-hour recurring ingestion
    try {
      const repeatableJobs = await discoveryQueue.getRepeatableJobs();
      for (const rJob of repeatableJobs) {
        if (rJob.name === 'dailyOpportunityDiscovery') {
          await discoveryQueue.removeRepeatableByKey(rJob.key);
        }
      }
      await discoveryQueue.add(
        'dailyOpportunityDiscovery',
        { interval: '2h' },
        {
          repeat: {
            every: 2 * 60 * 60 * 1000 // Every 2 hours
          },
          removeOnComplete: true,
          removeOnFail: 100
        }
      );
      console.log('[Worker] Scheduled 2-hour recurring opportunity discovery job in BullMQ.');
    } catch (schedErr) {
      console.error('[Worker] Failed to setup BullMQ repeatable schedule, using setInterval fallback:', schedErr);
      setInterval(runAllProviders, 2 * 60 * 60 * 1000);
    }

    const worker = new Worker('opportunity-discovery', async job => {
      console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
      
      if (job.name === 'dailyOpportunityDiscovery') {
        console.log('[Worker] Executing scheduled opportunity discovery and freshness check...');
        await runAllProviders();
        console.log('[Worker] Discovery complete.');
      } else if (job.name === 'personalizedOpportunityDiscovery') {
        console.log(`[Worker] Running personalized scout for user ${job.data.userId}`);
        const { runPersonalizedScout } = await import('./services/scout.service');
        await runPersonalizedScout(job.data.userId);
        console.log(`[Worker] Personalized scout complete for user ${job.data.userId}`);
      }
    }, { connection: redisConnection });

    worker.on('completed', job => {
      console.log(`[Worker] Job ${job.id} (${job.name}) has completed successfully!`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job?.id} (${job?.name}) failed: ${err.message}`);
    });

    console.log('[Worker] Redis connected');
    console.log('[Worker] Opportunity Intelligence Worker fully initialized and running.');
  } catch (error) {
    console.error('[Worker] Failed to start worker:', error);
    process.exit(1);
  }
}

startWorker();
