import mongoose from 'mongoose';
import IORedis from 'ioredis';
// @ts-ignore
import { Opportunity } from '../../../api/src/models/Opportunity';
// @ts-ignore
import { CareerProfile } from '../../../api/src/models/CareerProfile';
// @ts-ignore
import { UserOpportunityMatch } from '../../../api/src/models/UserOpportunityMatch';
// @ts-ignore
import { Notification } from '../../../api/src/models/Notification';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const runPersonalizedScout = async (userId: string) => {
  const profile = await CareerProfile.findOne({ userId });
  if (!profile) {
    console.warn(`[Scout Service] Career profile not found for user ${userId}`);
    return;
  }

  // 1. Extract user profile target attributes
  const targetRoles: string[] = profile.careerGoals?.targetRoles || [];
  
  const extractSkills = (skillCat: any[]): string[] => skillCat ? skillCat.map((s: any) => s.name || s).filter(Boolean) : [];
  
  const userSkills: string[] = [
    ...extractSkills(profile.skills?.programmingLanguages || []),
    ...extractSkills(profile.skills?.webDevelopment || []),
    ...extractSkills(profile.skills?.aiMachineLearning || []),
    ...extractSkills(profile.skills?.databases || []),
    ...extractSkills(profile.skills?.devopsCloud || []),
    ...((profile.skills as any)?.otherSkills || [])
  ];

  const userSkillsLower = userSkills.map(s => s.toLowerCase());

  // Education & Experience insights
  const educations = profile.education || [];
  const latestGradYear = educations.reduce((max: number, edu: any) => {
    return edu.graduationYear && edu.graduationYear > max ? edu.graduationYear : max;
  }, 0);
  const isStudent = latestGradYear >= new Date().getFullYear() || educations.length > 0;

  const experiences = profile.experience || [];
  const hasWorkExperience = experiences.length > 0 && !profile.hasNoExperience;

  const workPrefs = profile.locationPreferences?.workPreference?.map((p: string) => p.toLowerCase()) || [];
  const locPrefs = profile.locationPreferences?.preferredLocations?.map((p: string) => p.toLowerCase()) || [];
  const lookingFor = profile.careerGoals?.lookingFor?.map((l: string) => l.toLowerCase()) || [];

  // 2. Fetch active non-expired opportunities
  const opportunities = await Opportunity.find({ isActive: true, status: { $ne: 'EXPIRED' } });
  console.log(`[Scout Service] Scoring ${opportunities.length} active opportunities for user ${userId}...`);

  let newNotificationsCount = 0;

  for (const opp of opportunities) {
    let score = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchReasons: string[] = [];
    const eligibilityWarnings: string[] = [];

    // --- Component A: Technical Skills Match (Max: 40 points) ---
    const oppSkills: string[] = Array.isArray(opp.skills) ? opp.skills : [];
    
    if (oppSkills.length > 0) {
      let hits = 0;
      for (const reqSkill of oppSkills) {
        const isMatched = userSkillsLower.includes(reqSkill.toLowerCase()) ||
          userSkillsLower.some(us => us.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(us));
        
        if (isMatched) {
          hits++;
          matchedSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      }

      const ratio = hits / oppSkills.length;
      const skillScore = Math.round(ratio * 40);
      score += skillScore;

      if (hits > 0) {
        matchReasons.push(`Matches ${hits} of ${oppSkills.length} required skills (${matchedSkills.slice(0, 4).join(', ')})`);
      }
      if (missingSkills.length > 0) {
        matchReasons.push(`Key missing skills to develop: ${missingSkills.slice(0, 3).join(', ')}`);
      }
    } else {
      // If opportunity lacks structured skills, inspect description for user skills
      const descLower = (opp.description || '').toLowerCase();
      let descHits = 0;
      for (const us of userSkillsLower) {
        if (us.length > 2 && descLower.includes(us)) {
          descHits++;
          if (matchedSkills.length < 5) matchedSkills.push(us);
        }
      }
      const descScore = Math.min(25, descHits * 5);
      score += descScore;
      if (descHits > 0) {
        matchReasons.push(`Description mentions your skills (${matchedSkills.slice(0, 3).join(', ')})`);
      }
    }

    // --- Component B: Target Role & Domain (Max: 25 points) ---
    const titleLower = (opp.title || '').toLowerCase();
    const catLower = (opp.category || '').toLowerCase();
    
    if (targetRoles.length > 0) {
      const matchingRole = targetRoles.find(role => 
        titleLower.includes(role.toLowerCase()) || catLower.includes(role.toLowerCase())
      );
      if (matchingRole) {
        score += 25;
        matchReasons.push(`Opportunity title matches your target role: "${matchingRole}"`);
      } else {
        // Partial keyword match (e.g. "Engineer", "Developer", "Analyst")
        const keywords = ['engineer', 'developer', 'designer', 'analyst', 'manager', 'scientist', 'intern'];
        const hasKeywordMatch = keywords.some(kw => 
          titleLower.includes(kw) && targetRoles.some(tr => tr.toLowerCase().includes(kw))
        );
        if (hasKeywordMatch) {
          score += 15;
          matchReasons.push('Related to your target domain and role focus');
        } else {
          score += 8;
        }
      }
    } else {
      score += 12; // Neutral baseline if target roles not specified
    }

    // --- Component C: Work Mode & Location (Max: 15 points) ---
    const oppRemote = (opp.remoteType || '').toUpperCase();
    const oppLocLower = (opp.location || '').toLowerCase();

    if (oppRemote === 'REMOTE' && (workPrefs.includes('remote') || workPrefs.length === 0)) {
      score += 15;
      matchReasons.push('Fully matches your remote work preference');
    } else if (locPrefs.some(pref => oppLocLower.includes(pref))) {
      score += 15;
      matchReasons.push(`Located in your preferred region (${opp.location})`);
    } else if (oppRemote === 'HYBRID' && workPrefs.includes('hybrid')) {
      score += 12;
      matchReasons.push('Matches hybrid work preference');
    } else {
      score += 5; // Default partial location score
    }

    // --- Component D: Opportunity Type Alignment (Max: 10 points) ---
    if (opp.type === 'INTERNSHIP' && (lookingFor.includes('internship') || isStudent)) {
      score += 10;
      matchReasons.push('Matches your search for internships');
    } else if (opp.type === 'JOB' && lookingFor.includes('job')) {
      score += 10;
      matchReasons.push('Matches your goal for full-time job placement');
    } else if (opp.type === 'HACKATHON' || opp.type === 'COMPETITION') {
      if (lookingFor.includes('hackathon') || lookingFor.includes('competition')) {
        score += 10;
        matchReasons.push('Matches your interest in hackathons and coding competitions');
      } else {
        score += 7;
      }
    } else {
      score += 5;
    }

    // --- Component E: Experience & Eligibility Checks (Max: 10 points + Warnings) ---
    if (opp.type === 'INTERNSHIP') {
      if (!isStudent && latestGradYear > 0 && latestGradYear < new Date().getFullYear()) {
        eligibilityWarnings.push('This internship may require active student enrollment.');
      } else {
        score += 10;
      }
    } else if (opp.type === 'JOB') {
      const isSenior = /senior|lead|principal|staff|architect/i.test(opp.title);
      if (isSenior && !hasWorkExperience) {
        eligibilityWarnings.push('Senior/Lead role typically requires 4+ years of professional experience.');
      } else {
        score += 10;
      }
    } else {
      score += 10;
    }

    // Normalized Final Score (0 - 100)
    score = Math.min(100, Math.max(0, Math.round(score)));

    // Upsert UserOpportunityMatch
    const existingMatch = await UserOpportunityMatch.findOne({ userId, opportunityId: opp._id });

    if (score >= 25) {
      const matchDoc = await UserOpportunityMatch.findOneAndUpdate(
        { userId, opportunityId: opp._id },
        {
          $set: {
            matchScore: score,
            matchedSkills,
            missingSkills,
            matchReasons,
            eligibilityWarnings,
            generatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      // Section 5: Instant Personalized Notifications
      // Notify when newly discovered opportunity has high match (>= 60%), deduplicating via isNotified
      if (score >= 60 && !existingMatch?.isNotified) {
        try {
          const notif = await Notification.create({
            user: new mongoose.Types.ObjectId(userId),
            title: `High Match: ${opp.title} (${score}%)`,
            message: `${opp.organization} has an opening matching your profile in ${opp.location || 'Remote'}.`,
            type: 'OPPORTUNITY_MATCH',
            read: false,
            actionUrl: `/opportunities?id=${opp._id}`
          });

          // Mark match as notified so we never duplicate alerts
          await UserOpportunityMatch.findByIdAndUpdate(matchDoc._id, { isNotified: true });

          // Publish real-time SSE event
          await pubClient.publish('USER_EVENTS', JSON.stringify({
            userId: userId.toString(),
            event: {
              type: 'NOTIFICATION',
              data: notif
            }
          }));

          newNotificationsCount++;
        } catch (notifErr) {
          console.error('[Scout Service] Failed to dispatch notification:', notifErr);
        }
      }
    }
  }

  console.log(`[Scout Service] Completed scout for user ${userId}. Sent ${newNotificationsCount} new notifications.`);
};
