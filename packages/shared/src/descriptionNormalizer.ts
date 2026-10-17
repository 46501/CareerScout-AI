/**
 * Robust utility for decoding HTML entities and converting raw/escaped HTML job descriptions
 * into clean, readable, safely formatted plain text with preserved paragraphs and lists.
 */

const NAMED_ENTITIES: Record<string, string> = {
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

/**
 * Decodes all HTML entities (named, decimal, hex) without altering legitimate text.
 */
export function decodeHtmlEntities(str?: string | null): string {
  if (!str || typeof str !== 'string') return '';

  return str.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    const lower = match.toLowerCase();
    if (NAMED_ENTITIES[lower] !== undefined) {
      return NAMED_ENTITIES[lower];
    }

    // Decimal numeric entities: &#1234;
    const decMatch = match.match(/^&#(\d+);$/);
    if (decMatch) {
      const code = parseInt(decMatch[1], 10);
      try {
        return String.fromCodePoint(code);
      } catch {
        return '';
      }
    }

    // Hexadecimal entities: &#x1f600;
    const hexMatch = match.match(/^&#x([0-9a-fA-F]+);$/i);
    if (hexMatch) {
      const code = parseInt(hexMatch[1], 16);
      try {
        return String.fromCodePoint(code);
      } catch {
        return '';
      }
    }

    return match;
  });
}

/**
 * Checks if a string contains HTML markup or escaped HTML tags.
 */
export function isHtmlContent(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /<[a-z\/!][\s\S]*>/i.test(str) || /&lt;[a-z\/!][\s\S]*&gt;/i.test(str);
}

/**
 * Normalizes any job description (raw HTML, escaped HTML, nested HTML, or plain text)
 * into clean, readable text with preserved line breaks, bullet points, and decoded entities.
 */
export function normalizeJobDescription(input?: string | null): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') return String(input);

  let text = input.trim();
  if (!text) return '';

  // 1. Unescape escaped HTML tags if present (e.g. &lt;p ...&gt; or &lt;div&gt;)
  if (/&lt;[a-z\/!]/i.test(text)) {
    text = text
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&amp;/gi, '&');
  }

  // 2. Remove script, style, noscript, and comment tags with their contents
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 3. Remove non-content self-closing tags (img, svg, button)
  text = text.replace(/<img[^>]*>/gi, '');
  text = text.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');
  text = text.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');

  // 4. Convert list items to bullet points on new lines
  text = text.replace(/<li[^>]*>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '\n');
  text = text.replace(/<\/(ul|ol)>/gi, '\n\n');

  // 5. Convert block elements to clean line breaks
  text = text.replace(/<\/(h[1-6]|p|div|section|article|header|footer|blockquote)>/gi, '\n\n');
  text = text.replace(/<(h[1-6]|p|div|section|article|header|footer|blockquote)[^>]*>/gi, '\n');

  // 6. Convert line breaks and horizontal rules
  text = text.replace(/<(br|hr)\s*\/?>/gi, '\n');

  // 7. Table handling
  text = text.replace(/<\/tr>/gi, '\n');
  text = text.replace(/<\/(td|th)>/gi, ' ');

  // 8. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // 9. Decode HTML entities
  text = decodeHtmlEntities(text);

  // 10. Secondary pass for nested / double-escaped entities or tags
  if (/&[a-zA-Z0-9#]+;/.test(text)) {
    text = decodeHtmlEntities(text);
  }
  if (/<[a-z\/!]/i.test(text)) {
    text = text.replace(/<[^>]+>/g, '');
  }

  // 11. Normalize whitespace and clean up line breaks
  text = text.replace(/[\u00A0\u200B\uFEFF]/g, ' '); // non-breaking and zero-width spaces

  const lines = text.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim());

  // Collapse consecutive blank lines
  const cleanedLines: string[] = [];
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

/**
 * Returns a single-line excerpt of the job description, suitable for cards and compact lists.
 */
export function getJobDescriptionExcerpt(input?: string | null, maxLength = 200): string {
  const normalized = normalizeJobDescription(input);
  if (!normalized) return '';

  const singleLine = normalized.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= maxLength) return singleLine;
  return singleLine.slice(0, maxLength).trim() + '...';
}

const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ref', 'source', 'fbclid', 'gclid', 'mc_cid', 'mc_eid', '_hsenc', '_hsmi',
  'si', 'igshid', 'spm', 'trk'
]);

/**
 * Normalizes an external job / hackathon URL into a clean canonical URL
 * by stripping tracking parameters, hash fragments, and normalizing protocol and slashes.
 */
export function normalizeCanonicalUrl(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  try {
    const parsed = new URL(trimmed.startsWith('//') ? 'https:' + trimmed : trimmed);
    parsed.protocol = 'https:';
    parsed.hash = '';

    // Remove tracking query parameters
    const toDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      const lower = key.toLowerCase();
      if (TRACKING_PARAMS.has(lower) || lower.startsWith('utm_')) {
        toDelete.push(key);
      }
    });
    for (const key of toDelete) {
      parsed.searchParams.delete(key);
    }

    let result = parsed.toString();
    if (result.endsWith('/')) {
      result = result.slice(0, -1);
    }
    return result;
  } catch {
    // If not a valid parseable absolute URL, strip basic query params
    return trimmed.split('?')[0].replace(/\/+$/, '');
  }
}

