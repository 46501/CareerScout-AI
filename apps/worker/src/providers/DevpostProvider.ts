import axios from 'axios';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { normalizeJobDescription } from '../utils/descriptionNormalizer';

export class DevpostProvider {
  name = 'DevpostProvider';
  apiUrl = 'https://devpost.com/api/hackathons';

  async run() {
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

        const opp = {
          title: h.title,
          organization: 'Devpost Hackathon',
          organizationLogo: h.thumbnail_url ? (h.thumbnail_url.startsWith('//') ? 'https:' + h.thumbnail_url : h.thumbnail_url) : undefined,
          description: normalizeJobDescription(descText),
          type: 'HACKATHON',
          skills: themes.length > 0 ? themes : ['Software Development', 'Hackathon'],
          location: h.displayed_location?.location || 'Online',
          remoteType: (h.displayed_location?.location || '').toLowerCase().includes('online') ? 'REMOTE' : 'HYBRID',
          salary: cleanPrize || undefined,
          postedAt: new Date(),
          source: 'Devpost',
          sourceId: `devpost_${h.id}`,
          sourceUrl: h.url,
          applicationUrl: h.url,
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

      console.log(`[${this.name}] Successfully processed ${count} real hackathons from Devpost.`);
      return count;
    } catch (error) {
      console.error(`[${this.name}] Failed to fetch hackathons`, error);
      return 0;
    }
  }
}
