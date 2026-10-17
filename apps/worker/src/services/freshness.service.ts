import axios from 'axios';
// @ts-ignore
import { Opportunity } from '../../../api/src/models/Opportunity';

export async function revalidateOpportunityFreshness(): Promise<{ expiredByDeadline: number; checkedBatch: number }> {
  const now = new Date();
  console.log('[Freshness] Starting opportunity freshness revalidation...');

  // 1. Mark passed deadlines as EXPIRED
  const deadlineResult = await Opportunity.updateMany(
    {
      isActive: true,
      deadline: { $exists: true, $ne: null, $lt: now }
    },
    {
      $set: {
        status: 'EXPIRED',
        isActive: false,
        lastVerifiedAt: now
      }
    }
  );

  console.log(`[Freshness] Marked ${deadlineResult.modifiedCount} opportunities past their deadline as EXPIRED.`);

  // 2. Sample a batch of active opportunities for URL liveness revalidation
  const batch = await Opportunity.find({ isActive: true })
    .sort({ lastVerifiedAt: 1 })
    .limit(20);

  let verifiedCount = 0;

  for (const opp of batch) {
    const urlToCheck = opp.applicationUrl || opp.sourceUrl;
    if (!urlToCheck || !urlToCheck.startsWith('http')) continue;

    try {
      const res = await axios.head(urlToCheck, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CareerScout/1.0' },
        timeout: 6000,
        validateStatus: () => true // Handle all status codes without throwing
      });

      if (res.status === 404 || res.status === 410) {
        // Explicitly gone/not found
        await Opportunity.findByIdAndUpdate(opp._id, {
          status: 'EXPIRED',
          isActive: false,
          lastVerifiedAt: now
        });
        console.log(`[Freshness] Opportunity ${opp.title} (${opp._id}) returned ${res.status} -> Marked EXPIRED`);
      } else if (res.status >= 200 && res.status < 400) {
        await Opportunity.findByIdAndUpdate(opp._id, {
          status: 'ACTIVE',
          lastVerifiedAt: now
        });
        verifiedCount++;
      } else {
        // e.g. 403, 429, 500 - could be anti-scraping or temporary server issue. Mark UNVERIFIED, don't falsely expire
        await Opportunity.findByIdAndUpdate(opp._id, {
          status: 'UNVERIFIED',
          lastVerifiedAt: now
        });
      }
    } catch (err: any) {
      // Network timeout / connection error - Mark UNVERIFIED without deleting or falsely expiring
      await Opportunity.findByIdAndUpdate(opp._id, {
        status: 'UNVERIFIED',
        lastVerifiedAt: now
      });
    }
  }

  console.log(`[Freshness] Batch check complete: ${verifiedCount} verified active.`);
  return {
    expiredByDeadline: deadlineResult.modifiedCount,
    checkedBatch: batch.length
  };
}
