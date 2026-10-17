const mongoose = require('mongoose');

// Inlined logic matching packages/shared/src/descriptionNormalizer.ts
const NAMED_ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
  '&#39;': "'", '&apos;': "'", '&cent;': '¢', '&pound;': '£', '&yen;': '¥',
  '&euro;': '€', '&copy;': '©', '&reg;': '®', '&trade;': '™', '&bull;': '•',
  '&mdash;': '—', '&ndash;': '–', '&hellip;': '...'
};

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    const lower = match.toLowerCase();
    if (NAMED_ENTITIES[lower] !== undefined) return NAMED_ENTITIES[lower];
    const decMatch = match.match(/^&#(\d+);$/);
    if (decMatch) {
      try { return String.fromCodePoint(parseInt(decMatch[1], 10)); } catch { return ''; }
    }
    return match;
  });
}

function normalizeJobDescription(input) {
  if (!input) return '';
  let text = String(input).trim();
  if (!text) return '';

  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<li[^>]*>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/(h[1-6]|p|div|section|article|blockquote)>/gi, '\n\n');
  text = text.replace(/<(h[1-6]|p|div|section|article|blockquote)[^>]*>/gi, '\n');
  text = text.replace(/<(br|hr)\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = decodeHtmlEntities(text);
  if (/<[a-z\/!]/i.test(text)) text = text.replace(/<[^>]+>/g, '');
  return text.split('\n').map(l => l.trim()).filter(Boolean).join('\n\n');
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerscout';
  console.log('Connecting to MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  const oppsCol = db.collection('opportunities');

  console.log('\n--- 1. Ingesting from Remotive API ---');
  try {
    const remotiveRes = await fetch('https://remotive.com/api/remote-jobs?limit=50');
    const remotiveData = await remotiveRes.json();
    const remotiveJobs = remotiveData?.jobs || [];
    let remotiveCount = 0;

    for (const job of remotiveJobs) {
      const isInternship = /intern/i.test(job.title) || 
        (job.tags && job.tags.some(t => /intern/i.test(t))) || 
        job.job_type === 'internship';

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
        isActive: true,
        lastVerifiedAt: new Date()
      };

      await oppsCol.updateOne(
        { sourceId: opp.sourceId, source: opp.source },
        { $set: opp },
        { upsert: true }
      );
      remotiveCount++;
    }
    console.log(`Remotive: Saved/updated ${remotiveCount} opportunities.`);
  } catch (err) {
    console.error('Remotive ingestion error:', err.message);
  }

  console.log('\n--- 2. Ingesting from Arbeitnow API (Jobs & Internships) ---');
  try {
    const arbeitRes = await fetch('https://www.arbeitnow.com/api/job-board-api', {
      headers: { 'User-Agent': 'CareerScoutAI/1.0' }
    });
    const arbeitData = await arbeitRes.json();
    const arbeitJobs = arbeitData?.data || [];
    let arbeitCount = 0;
    let internCount = 0;

    for (const item of arbeitJobs) {
      const internRegex = /\bintern(ship)?s?\b/i;
      const isInternship = 
        internRegex.test(item.title || '') ||
        (item.job_types || []).some(t => internRegex.test(t)) ||
        (item.tags || []).some(t => internRegex.test(t));

      const opp = {
        title: item.title,
        organization: item.company_name,
        description: normalizeJobDescription(item.description),
        type: isInternship ? 'INTERNSHIP' : 'JOB',
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

      await oppsCol.updateOne(
        { sourceId: opp.sourceId, source: opp.source },
        { $set: opp },
        { upsert: true }
      );
      arbeitCount++;
      if (isInternship) internCount++;
    }
    console.log(`Arbeitnow: Saved/updated ${arbeitCount} opportunities (${internCount} internships).`);
  } catch (err) {
    console.error('Arbeitnow ingestion error:', err.message);
  }

  console.log('\n--- 3. Ingesting from Devpost API (Hackathons) ---');
  try {
    const devpostRes = await fetch('https://devpost.com/api/hackathons', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const devpostData = await devpostRes.json();
    const hackathons = devpostData?.hackathons || [];
    let devpostCount = 0;

    for (const h of hackathons) {
      const cleanPrize = h.prize_amount ? h.prize_amount.replace(/<[^>]+>/g, '').trim() : '';
      const themes = (h.themes || []).map(t => t.name).filter(Boolean);
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

      await oppsCol.updateOne(
        { sourceId: opp.sourceId, source: opp.source },
        { $set: opp },
        { upsert: true }
      );
      devpostCount++;
    }
    console.log(`Devpost: Saved/updated ${devpostCount} hackathons.`);
  } catch (err) {
    console.error('Devpost ingestion error:', err.message);
  }

  // Count by category
  const categories = await oppsCol.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]).toArray();

  console.log('\n=== CURRENT DATABASE TOTALS BY CATEGORY ===');
  for (const c of categories) {
    console.log(`  ${c._id}: ${c.count}`);
  }
  const total = await oppsCol.countDocuments({});
  console.log(`Total active opportunities in DB: ${total}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
