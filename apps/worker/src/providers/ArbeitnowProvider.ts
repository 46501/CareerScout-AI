import axios from 'axios';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { OpportunitySource } from '../../../api/src/models/OpportunitySource';
import { normalizeJobDescription, normalizeCanonicalUrl } from '../utils/descriptionNormalizer';

export class ArbeitnowProvider {
  name = 'ArbeitnowProvider';
  identifier = 'arbeitnow';
  apiUrl = 'https://www.arbeitnow.com/api/job-board-api';

  async run() {
    const startTime = Date.now();
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
        const internRegex = /\bintern(ship)?s?\b/i;
        const isInternship = 
          internRegex.test(item.title || '') ||
          (item.job_types || []).some((t: string) => internRegex.test(t)) ||
          (item.tags || []).some((t: string) => internRegex.test(t));

        const oppType = isInternship ? 'INTERNSHIP' : 'JOB';
        const canonical = normalizeCanonicalUrl(item.url);

        const opp = {
          title: item.title,
          organization: item.company_name,
          description: normalizeJobDescription(item.description),
          type: oppType,
          category: isInternship ? 'Internship' : (item.job_types?.[0] || 'Full Time'),
          skills: item.tags || [],
          location: item.location || 'Remote',
          remoteType: item.remote ? 'REMOTE' : (item.location ? 'ONSITE' : 'ANY'),
          postedAt: item.created_at ? new Date(item.created_at * 1000) : new Date(),
          source: 'Arbeitnow',
          sourceId: item.slug || item.url,
          sourceUrl: item.url,
          applicationUrl: item.url,
          canonicalUrl: canonical,
          status: 'ACTIVE',
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

      const activeCount = await Opportunity.countDocuments({ source: 'Arbeitnow', isActive: true });
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Arbeitnow Jobs & Internships',
          identifier: this.identifier,
          type: 'API',
          status: 'ACTIVE',
          lastRunAt: new Date(),
          lastSuccessAt: new Date(),
          opportunitiesFound: count,
          totalOpportunitiesActive: activeCount,
          lastRunDurationMs: Date.now() - startTime
        },
        { upsert: true }
      );

      console.log(`[${this.name}] Successfully processed ${count} opportunities (${internshipCount} internships, ${jobCount} jobs, ${activeCount} active in DB).`);
      return count;
    } catch (error: any) {
      console.error(`[${this.name}] Provider error:`, error?.message || error);
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Arbeitnow Jobs & Internships',
          identifier: this.identifier,
          type: 'API',
          status: 'ERROR',
          lastRunAt: new Date(),
          lastError: error?.message || 'Failed to fetch from Arbeitnow',
          lastRunDurationMs: Date.now() - startTime
        },
        { upsert: true }
      );
      return 0;
    }
  }
}
