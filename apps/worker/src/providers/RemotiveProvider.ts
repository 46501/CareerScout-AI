import axios from 'axios';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { OpportunitySource } from '../../../api/src/models/OpportunitySource';
import { normalizeJobDescription, normalizeCanonicalUrl } from '../utils/descriptionNormalizer';

export class RemotiveProvider {
  name = 'RemotiveProvider';
  identifier = 'remotive';
  apiUrl = 'https://remotive.com/api/remote-jobs?limit=50';

  async run() {
    const startTime = Date.now();
    console.log(`[${this.name}] Fetching real opportunities from Remotive API...`);
    
    try {
      const response = await axios.get(this.apiUrl, { timeout: 15000 });
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

        const canonical = normalizeCanonicalUrl(job.url);

        const opp = {
          title: job.title,
          organization: job.company_name,
          organizationLogo: job.company_logo || undefined,
          description: normalizeJobDescription(job.description),
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
          applicationUrl: job.url,
          canonicalUrl: canonical,
          status: 'ACTIVE',
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

      const activeCount = await Opportunity.countDocuments({ source: 'Remotive', isActive: true });
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Remotive Remote Jobs',
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

      console.log(`[${this.name}] Successfully processed ${count} real opportunities (${activeCount} active).`);
      return count;
    } catch (error: any) {
      console.error(`[${this.name}] Provider error:`, error?.message || error);
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Remotive Remote Jobs',
          identifier: this.identifier,
          type: 'API',
          status: 'ERROR',
          lastRunAt: new Date(),
          lastError: error?.message || 'Failed to fetch from Remotive',
          lastRunDurationMs: Date.now() - startTime
        },
        { upsert: true }
      );
      return 0;
    }
  }
}
