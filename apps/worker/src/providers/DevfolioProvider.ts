import axios from 'axios';
import { Opportunity } from '../../../api/src/models/Opportunity';
import { OpportunitySource } from '../../../api/src/models/OpportunitySource';
import { normalizeJobDescription, normalizeCanonicalUrl } from '../utils/descriptionNormalizer';

export class DevfolioProvider {
  name = 'DevfolioProvider';
  identifier = 'devfolio';
  apiUrl = 'https://api.devfolio.co/api/hackathons?filter=all&page=1&limit=30';

  async run() {
    const startTime = Date.now();
    console.log(`[${this.name}] Fetching real hackathons and competitions from Devfolio API...`);
    
    try {
      const response = await axios.get(this.apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: 15000
      });

      const items = response.data?.result || response.data?.hackathons || [];
      if (!Array.isArray(items)) {
        throw new Error('Invalid response format from Devfolio API');
      }

      let count = 0;
      const now = new Date();

      for (const it of items) {
        if (!it.name || !it.slug) continue;

        const regEndsAt = it.hackathon_setting?.reg_ends_at ? new Date(it.hackathon_setting.reg_ends_at) : (it.ends_at ? new Date(it.ends_at) : undefined);
        const isPastDeadline = regEndsAt ? regEndsAt < now : false;

        const isCompetition = /competition|contest|challenge|cup/i.test(it.name);
        const oppType = isCompetition ? 'COMPETITION' : 'HACKATHON';

        const directUrl = it.hackathon_setting?.site || `https://${it.slug}.devfolio.co`;
        const canonical = normalizeCanonicalUrl(directUrl);

        const descText = [
          it.tagline || '',
          it.desc || '',
          it.starts_at && it.ends_at ? `Event dates: ${new Date(it.starts_at).toLocaleDateString()} to ${new Date(it.ends_at).toLocaleDateString()}.` : '',
          regEndsAt ? `Registration deadline: ${regEndsAt.toLocaleDateString()}.` : '',
          it.is_online ? 'Format: Fully Online / Remote.' : 'Format: In-person / Hybrid gathering.',
          'Open for student and developer registrations on Devfolio.'
        ].filter(Boolean).join(' ');

        const opp = {
          title: it.name,
          organization: 'Devfolio Community',
          organizationLogo: it.hackathon_setting?.logo || undefined,
          description: normalizeJobDescription(descText || it.name),
          type: oppType,
          category: isCompetition ? 'Coding Competition' : 'Hackathon',
          skills: ['Software Development', isCompetition ? 'Competition' : 'Hackathon', 'Problem Solving'],
          location: it.is_online ? 'Online' : (it.location || 'Various'),
          remoteType: it.is_online ? 'REMOTE' : 'HYBRID',
          deadline: regEndsAt,
          postedAt: it.starts_at ? new Date(it.starts_at) : now,
          source: 'Devfolio',
          sourceId: `devfolio_${it.slug}`,
          sourceUrl: directUrl,
          applicationUrl: directUrl,
          canonicalUrl: canonical,
          status: isPastDeadline ? 'EXPIRED' : 'ACTIVE',
          isActive: !isPastDeadline,
          lastVerifiedAt: now,
          metadata: {
            slug: it.slug,
            regStartsAt: it.hackathon_setting?.reg_starts_at,
            regEndsAt: it.hackathon_setting?.reg_ends_at,
            startsAt: it.starts_at,
            endsAt: it.ends_at
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
          console.error(`[${this.name}] Failed to save opportunity ${opp.sourceId}:`, err);
        }
      }

      const activeCount = await Opportunity.countDocuments({ source: 'Devfolio', isActive: true });
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Devfolio Hackathons & Competitions',
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

      console.log(`[${this.name}] Successfully processed ${count} opportunities (${activeCount} active).`);
      return count;
    } catch (error: any) {
      console.error(`[${this.name}] Provider error:`, error?.message || error);
      await OpportunitySource.findOneAndUpdate(
        { identifier: this.identifier },
        {
          name: 'Devfolio Hackathons & Competitions',
          identifier: this.identifier,
          type: 'API',
          status: 'ERROR',
          lastRunAt: new Date(),
          lastError: error?.message || 'Failed to fetch from Devfolio',
          lastRunDurationMs: Date.now() - startTime
        },
        { upsert: true }
      );
      return 0;
    }
  }
}
