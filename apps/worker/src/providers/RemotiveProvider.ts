import axios from 'axios';
import mongoose from 'mongoose';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { normalizeJobDescription } from '../utils/descriptionNormalizer';

export class RemotiveProvider {
  name = 'RemotiveProvider';
  apiUrl = 'https://remotive.com/api/remote-jobs?limit=50'; // Fetch 50 most recent jobs to avoid blowing up MongoDB on dev

  async run() {
    console.log(`[${this.name}] Fetching real opportunities from Remotive API...`);
    
    try {
      const response = await axios.get(this.apiUrl);
      if (!response.data || !response.data.jobs) {
        throw new Error('Invalid response from Remotive API');
      }

      const jobs = response.data.jobs;
      let count = 0;

      for (const job of jobs) {
        const internRegex = /\bintern(ship)?s?\b/i;
        const isInternship = internRegex.test(job.title || '') || 
          (job.tags && job.tags.some((t: string) => internRegex.test(t))) || 
          internRegex.test(job.job_type || '');

        const opp = {
          title: job.title,
          organization: job.company_name,
          organizationLogo: job.company_logo || undefined,
          description: normalizeJobDescription(job.description), // Normalized clean text without HTML artifacts
          type: isInternship ? 'INTERNSHIP' : 'JOB',
          category: job.category || (job.job_type === 'contract' ? 'Contract' : 'Full Time'),
          skills: job.tags || [],
          location: job.candidate_required_location || 'Worldwide',
          remoteType: 'REMOTE',
          salary: job.salary || undefined,
          postedAt: new Date(job.publication_date),
          source: 'Remotive',
          sourceId: job.id.toString(),
          sourceUrl: job.url,
          applicationUrl: job.url, // Remotive uses their URL for apply redirects
          isActive: true,
          lastVerifiedAt: new Date(),
        };

        try {
          await Opportunity.findOneAndUpdate(
            { sourceId: opp.sourceId, source: opp.source },
            opp,
            { upsert: true, new: true, runValidators: true }
          );
          count++;
        } catch (err) {
          console.error(`[${this.name}] Failed to save opportunity ${opp.sourceId}`, err);
        }
      }

      console.log(`[${this.name}] Successfully processed ${count} real opportunities.`);
      return count;
    } catch (error) {
      console.error(`[${this.name}] Failed to fetch opportunities`, error);
      return 0;
    }
  }
}
