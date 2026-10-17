const mongoose = require('mongoose');

// Inlined logic matching packages/shared/src/descriptionNormalizer.ts
const NAMED_ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&cent;': '¢',
  '&pound;': '£',
  '&yen;': '¥',
  '&euro;': '€',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&bull;': '•',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '...',
  '&lsquo;': "'",
  '&rsquo;': "'",
  '&ldquo;': '"',
  '&rdquo;': '"',
  '&middot;': '·',
  '&times;': '×',
  '&divide;': '÷',
  '&deg;': '°',
  '&plusmn;': '±',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾'
};

function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    const lower = match.toLowerCase();
    if (NAMED_ENTITIES[lower] !== undefined) {
      return NAMED_ENTITIES[lower];
    }
    const decMatch = match.match(/^&#(\d+);$/);
    if (decMatch) {
      const code = parseInt(decMatch[1], 10);
      try { return String.fromCodePoint(code); } catch { return ''; }
    }
    const hexMatch = match.match(/^&#x([0-9a-fA-F]+);$/i);
    if (hexMatch) {
      const code = parseInt(hexMatch[1], 16);
      try { return String.fromCodePoint(code); } catch { return ''; }
    }
    return match;
  });
}

function normalizeJobDescription(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  let text = input.trim();
  if (!text) return '';

  if (/&lt;[a-z\/!]/i.test(text)) {
    text = text
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, '&');
  }

  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  text = text.replace(/<img[^>]*>/gi, '');
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
  text = text.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');

  text = text.replace(/<li[^>]*>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/(ul|ol)>/gi, '\n\n');

  text = text.replace(/<\/(h[1-6]|p|div|section|article|header|footer|blockquote)>/gi, '\n\n');
  text = text.replace(/<(h[1-6]|p|div|section|article|header|footer|blockquote)[^>]*>/gi, '\n');

  text = text.replace(/<(br|hr)\s*\/?>/gi, '\n');

  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/(td|th)>/gi, ' ');

  text = text.replace(/<[^>]+>/g, '');

  text = decodeHtmlEntities(text);

  if (/&[a-zA-Z0-9#]+;/.test(text)) {
    text = decodeHtmlEntities(text);
  }
  if (/<[a-z\/!]/i.test(text)) {
    text = text.replace(/<[^>]+>/g, '');
  }

  text = text.replace(/[\u00A0\u200B\uFEFF]/g, ' ');

  const lines = text.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim());

  const cleanedLines = [];
  let blankCount = 0;
  for (const line of lines) {
    if (!line) {
      blankCount++;
      if (blankCount <= 1) {
        cleanedLines.push('');
      }
    } else {
      blankCount = 0;
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join('\n').trim();
}

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerscout';
  console.log(`Connecting to ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  const db = mongoose.connection.db;
  const oppsCol = db.collection('opportunities');

  const opportunities = await oppsCol.find({}).toArray();
  console.log(`Found ${opportunities.length} total opportunities in database.`);

  let updatedCount = 0;

  for (const opp of opportunities) {
    const rawDesc = opp.description || '';
    const cleanDesc = normalizeJobDescription(rawDesc);

    if (rawDesc !== cleanDesc) {
      await oppsCol.updateOne(
        { _id: opp._id },
        { $set: { description: cleanDesc } }
      );
      updatedCount++;
      console.log(`\n[Updated] ${opp.title} (${opp.organization})`);
      console.log(`  BEFORE (first 80 chars): ${rawDesc.slice(0, 80).replace(/\n/g, ' ')}...`);
      console.log(`  AFTER  (first 80 chars): ${cleanDesc.slice(0, 80).replace(/\n/g, ' ')}...`);
    }
  }

  console.log(`\nMigration complete! Updated ${updatedCount} / ${opportunities.length} opportunities.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
