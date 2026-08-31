import cron from 'node-cron';
import { runAgent } from '../agent/agent';

export const startScheduler = () => {
  // Run every 24 hours at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running 24-hour scheduled agent discovery...');
    try {
      await runAgent();
      console.log('Scheduled agent run completed.');
    } catch (error) {
      console.error('Scheduled agent run failed:', error);
    }
  });
  console.log('Scheduler started. Agent will run every 24 hours at midnight.');
};
