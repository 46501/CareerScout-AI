import axios from 'axios';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { OpportunitySource } from '../../../api/src/models/OpportunitySource';
import { normalizeJobDescription, normalizeCanonicalUrl } from '../utils/descriptionNormalizer';

export class DevpostProvider {
  name = 'DevpostProvider';
  identifier = 'devpost';
  apiUrl = 'https://devpost.com/api/hackathons';

  async run() {
    const startTime = Date.now();
    console.log(`[${this.name}] Fetching real hackathons from Devpost API...`);
    
    try {
      const response = await axios.get(this.apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000
      });

      if (!response.data || !Array.isArray(response.data.hackathons)) {
        throw new Error('Invalid response from Devpost API');
      }

      const hackathons = response.data.hackathons;
      let count = 0;

      for (const h of hackathons) {
        const cleanPrize = h.prize_amount ? h.prize_amount.replace(/<[^>]+>/g, '').trim() : '';
        const themes = (h.themes || []).map((t: any) => t.name).filter(Boolean);
        const descText = [
          h.submission_period_dates ? `Submission Period: ${h.submission_period_dates}.` : '',
          cleanPrize ? `Total Prizes: ${cleanPrize}.` : '',
          h.displayed_location?.location ? `Format: ${h.displayed_location.location}.` : '',
          'Participate, build innovative projects, and compete for prizes and recognition.'
        ].filter(Boolean).join(' ');

        const canonical = normalizeCanonicalUrl(h.url);

        const opp = {
          title: h.title,
          organization: 'Devpost Hackathon',
          organizationLogo: h.thumbnail_url ? (h.thumbnail_url.startsWith('//') ? 'https:' + h.thumbnail_url : h.thumbnail_url) : undefined,
          description: normalizeJobDescription(descText),
          type: 'HACKATHON',
          category: 'Hackathon',
          skills: themes.length > 0 ? themes : ['Software Development', 'Hackathon'],
          location: h.displayed_location?.location || 'Online',
          remoteType: (h.displayed_location?.location || '').toLowerCase().includes('online') ? 'REMOTE' : 'HYBRID',
          salary: cleanPrize || undefined,
          postedAt: new Date(),
          source: 'Devpost',
          sourceId: `devpost_${h.id}`,
          sourceUrl: h.url,
          applicationUrl: h.url,
          canonicalUrl: canonical,
          status: 'ACTIVE',
          isActive: true,
          lastVerifiedAt: new Date(),
          metadata: {
            openState: h.open_state,
            submissionPeriod: h.submission_period_dates
          }
        };

        try {
          await Opportunity.findOneAndUpdate(
            { sourceId: opp.sourceId, source: opp.source },
            opp,
            { upsert: true, new: true, runValidators: true }
          );
          count++;
        } catch (err) {
          console.error(`[${this.name}] Failed to save hackathon ${opp.sourceId}`, err);
        }
      }

      const activeCount = await Opportunity.countDocuments({ source: 'Devpost', isActive: true });
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Devpost Hackathons',
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

      console.log(`[${this.name}] Successfully processed ${count} real hackathons (${activeCount} active).`);
      return count;
    } catch (error: any) {
      console.error(`[${this.name}] Provider error:`, error?.message || error);
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Devpost Hackathons',
          identifier: this.identifier,
          type: 'API',
          status: 'ERROR',
          lastRunAt: new Date(),
          lastError: error?.message || 'Failed to fetch from Devpost',
          lastRunDurationMs: Date.now() - startTime
        },
        { upsert: true }
      );
      return 0;
    }
  }
}
