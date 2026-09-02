import cron from 'node-cron';
import { fetchAndStoreOpportunities } from '../services/opportunityFetcher';

export const startScheduler = () => {
  // Run every 24 hours at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running 24-hour scheduled opportunity discovery...');
    try {
      await fetchAndStoreOpportunities();
      console.log('Scheduled discovery run completed.');
    } catch (error) {
      console.error('Scheduled discovery run failed:', error);
    }
  });
  console.log('Scheduler started. Opportunity discovery will run every 24 hours at midnight.');
};
