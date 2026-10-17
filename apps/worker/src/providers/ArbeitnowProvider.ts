import axios from 'axios';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { normalizeJobDescription } from '../utils/descriptionNormalizer';

export class ArbeitnowProvider {
  name = 'ArbeitnowProvider';
  apiUrl = 'https://www.arbeitnow.com/api/job-board-api';

  async run() {
    console.log(`[${this.name}] Fetching real opportunities from Arbeitnow API...`);
    
    try {
      const response = await axios.get(this.apiUrl, {
        headers: { 'User-Agent': 'CareerScoutAI/1.0' },
        timeout: 15000
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response from Arbeitnow API');
      }

      const jobs = response.data.data;
      let count = 0;
      let internshipCount = 0;
      let jobCount = 0;

      for (const item of jobs) {
        // Robust word-boundary check for genuine internships (avoids false positives like 'international')
        const internRegex = /\bintern(ship)?s?\b/i;
        const isInternship = 
          internRegex.test(item.title || '') ||
          (item.job_types || []).some((t: string) => internRegex.test(t)) ||
          (item.tags || []).some((t: string) => internRegex.test(t));

        const oppType = isInternship ? 'INTERNSHIP' : 'JOB';

        const opp = {
          title: item.title,
          organization: item.company_name,
          description: normalizeJobDescription(item.description),
          type: oppType,
          skills: item.tags || [],
          location: item.location || 'Remote',
          remoteType: item.remote ? 'REMOTE' : (item.location ? 'ONSITE' : 'ANY'),
          postedAt: item.created_at ? new Date(item.created_at * 1000) : new Date(),
          source: 'Arbeitnow',
          sourceId: item.slug || item.url,
          sourceUrl: item.url,
          applicationUrl: item.url,
          isActive: true,
          lastVerifiedAt: new Date(),
          metadata: {
            jobTypes: item.job_types
          }
        };

        try {
          await Opportunity.findOneAndUpdate(
            { sourceId: opp.sourceId, source: opp.source },
            opp,
            { upsert: true, new: true, runValidators: true }
          );
          count++;
          if (isInternship) {
            internshipCount++;
          } else {
            jobCount++;
          }
        } catch (err) {
          console.error(`[${this.name}] Failed to save opportunity ${opp.sourceId}`, err);
        }
      }

      console.log(`[${this.name}] Successfully processed ${count} opportunities (${internshipCount} internships, ${jobCount} jobs).`);
      return count;
    } catch (error) {
      console.error(`[${this.name}] Failed to fetch opportunities`, error);
      return 0;
    }
  }
}
