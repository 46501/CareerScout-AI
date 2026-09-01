import cron from 'node-cron';
import { runAgent } from '../agent/agent';
import User from '../models/User';

export const startScheduler = () => {
  // Run every 24 hours at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running 24-hour scheduled agent discovery...');
    try {
      const users = await User.find({});
      for (const user of users) {
        try {
          console.log(`Running agent for user ${user._id}`);
          await runAgent(user._id.toString());
        } catch (err) {
          console.error(`Failed agent run for user ${user._id}:`, err);
        }
      }
      console.log('Scheduled agent run completed for all users.');
    } catch (error) {
      console.error('Scheduled agent run failed:', error);
    }
  });
  console.log('Scheduler started. Agent will run every 24 hours at midnight.');
};
