import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { User } from '../models/User';
import { CareerProfile } from '../models/CareerProfile';
import { Opportunity } from '../models/Opportunity';
import { Notification } from '../models/Notification';
import { calculateMatchScore } from '../services/ai.service';
import { OpportunitySource } from '../models/OpportunitySource';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });

async function fetchHackerNewsJobs() {
  try {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
    const jobIds = await response.json();
    
    // Fetch top 5 jobs to save time
    const jobs = [];
    for (const id of jobIds.slice(0, 5)) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const item = await itemRes.json();
      
      if (item && item.title) {
        // Simple extraction logic for HN jobs
        // Example HN title: "Stripe (YC S09) Is Hiring Engineers"
        const titleParts = item.title.split('Is Hiring');
        const organization = titleParts.length > 1 ? titleParts[0].trim() : 'HackerNews Startup';
        const role = titleParts.length > 1 ? titleParts[1].trim() : item.title;

        jobs.push({
          title: role,
          organization: organization,
          location: item.text?.toLowerCase().includes('remote') ? 'Remote' : 'Various',
          type: 'JOB',
          remoteType: item.text?.toLowerCase().includes('remote') ? 'REMOTE' : 'HYBRID',
          description: item.text ? item.text.replace(/<[^>]*>?/gm, '') : item.title,
          skills: ['Engineering', 'Software Development'], // Default skills, since HN doesn't provide structured tags
          applicationUrl: item.url || `https://news.ycombinator.com/item?id=${id}`,
          postedAt: new Date(item.time * 1000)
        });
      }
    }
    return jobs;
  } catch (error) {
    console.error('Failed to fetch from HackerNews:', error);
    return [];
  }
}

export const scoutWorker = new Worker('opportunity-discovery', async (job: Job) => {
  console.log(`[Scout Worker] Processing job ${job.id} for user ${job.data.userId}`);
  const { userId } = job.data;
  
  try {
    const user = await User.findById(userId);
    const profile = await CareerProfile.findOne({ userId });
    
    if (!user || !profile) {
      throw new Error(`User or Profile not found for userId: ${userId}`);
    }

    console.log(`[Scout Worker] Fetching real opportunities from HackerNews...`);
    const hnJobs = await fetchHackerNewsJobs();
    
    let matchesFound = 0;

    for (const scrapedJob of hnJobs) {
      const matchResult = calculateMatchScore(profile, scrapedJob);
      
      // Save if match score is decent, or save anyway for demo purposes (score > 10)
      if (matchResult.score > 10) {
        const exists = await Opportunity.findOne({ title: scrapedJob.title, organization: scrapedJob.organization });
        if (!exists) {
          await Opportunity.create({
            ...scrapedJob,
            matchDetails: matchResult,
            skills: scrapedJob.skills
          });
          
          matchesFound++;

          // Send notification only for High Matches (> 50%)
          if (matchResult.score >= 50) {
            await Notification.create({
              userId: userId,
              title: 'New AI Job Match Found!',
              message: `We found a ${matchResult.score}% match for ${scrapedJob.title} at ${scrapedJob.organization}.`,
              type: 'SYSTEM',
              read: false
            });
          }
        }
      }
    }

    // After processing, update the user's status back to ACTIVE if it was in some other loading state, or keep it.
    // Ensure we log completion
    await Notification.create({
      userId: userId,
      title: 'Scouting Completed',
      message: `CareerScout AI finished scouring the web. We found ${matchesFound} new matches.`,
      type: 'SYSTEM',
      read: false
    });

    console.log(`[Scout Worker] Finished processing for ${userId}. Found ${matchesFound} new matches.`);
    return { success: true, matchesFound };

  } catch (error) {
    console.error(`[Scout Worker] Error processing job ${job.id}:`, error);
    throw error;
  }
}, { connection: redisConnection });

scoutWorker.on('completed', job => {
  console.log(`[Scout Worker] Job ${job.id} completed!`);
});

scoutWorker.on('failed', (job, err) => {
  console.log(`[Scout Worker] Job ${job?.id} failed with error ${err.message}`);
});
