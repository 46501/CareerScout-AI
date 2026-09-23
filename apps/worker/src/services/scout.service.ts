import mongoose from 'mongoose';
import { Opportunity } from '../../api/src/models/Opportunity';
import { CareerProfile } from '../../api/src/models/CareerProfile';
import { UserOpportunityMatch } from '../../api/src/models/UserOpportunityMatch';

export const runPersonalizedScout = async (userId: string) => {
  const profile = await CareerProfile.findOne({ userId });
  if (!profile) throw new Error('Career profile not found for user');

  // Step 1: Generate personalized query rules
  // In a real application, we would call Gemini to generate complex boolean logic
  // For this optimized MVP, we'll use deterministic mapping
  const targetRoles = profile.preferences?.preferredRoles || [];
  const targetSkills = [
    ...(profile.skills?.programmingLanguages || []),
    ...(profile.skills?.frameworks || []),
    ...(profile.skills?.databases || []),
    ...(profile.skills?.cloud || [])
  ];

  // Step 2: Fetch broad matches from DB
  // Optimize: query only active opportunities created recently or where source matches
  const broadMatches = await Opportunity.find({ isActive: true });

  // Step 3: Compute localized match score
  // We'll iterate through opportunities and calculate a deterministic score
  for (const opp of broadMatches) {
    let score = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchReasons: string[] = [];

    // Evaluate Skills Match (Weight: 50%)
    if (opp.skills && opp.skills.length > 0) {
      let skillHits = 0;
      for (const skill of opp.skills) {
        if (targetSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
          skillHits++;
          matchedSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      }
      
      const skillScore = (skillHits / opp.skills.length) * 50;
      score += skillScore;
      
      if (skillHits > 0) {
        matchReasons.push(`Matches ${skillHits} of your skills (${matchedSkills.join(', ')})`);
      }
      if (missingSkills.length > 0) {
        matchReasons.push(`Missing preferred skills: ${missingSkills.slice(0, 3).join(', ')}`);
      }
    } else {
      score += 25; // Neutral weight if no skills specified on opportunity
    }

    // Evaluate Role Match (Weight: 20%)
    const isRoleMatch = targetRoles.some(role => opp.title.toLowerCase().includes(role.toLowerCase()));
    if (isRoleMatch) {
      score += 20;
      matchReasons.push(`Title matches your preferred role`);
    }

    // Evaluate Location/Remote (Weight: 15%)
    let locScore = 0;
    if (opp.remoteType === 'REMOTE' && profile.preferences?.remotePreference !== 'ONSITE') {
      locScore = 15;
      matchReasons.push('Matches your remote preference');
    } else if (profile.preferences?.preferredLocations?.some(loc => opp.location?.toLowerCase().includes(loc.toLowerCase()))) {
      locScore = 15;
      matchReasons.push(`Matches your preferred location (${opp.location})`);
    } else {
      locScore = 5; // Partial default
    }
    score += locScore;

    // Evaluate Type (Weight: 15%)
    let typeScore = 0;
    if (opp.type === 'JOB' && profile.preferences?.jobPreference) {
      typeScore = 15;
      matchReasons.push('Matches your job preference');
    } else if (opp.type === 'INTERNSHIP' && profile.preferences?.internshipPreference) {
      typeScore = 15;
      matchReasons.push('Matches your internship preference');
    } else {
      typeScore = 5;
    }
    score += typeScore;

    score = Math.min(Math.round(score), 100);

    // Step 4: Upsert UserOpportunityMatch
    // We only care about opportunities scoring reasonably well (e.g. > 30%)
    if (score >= 30) {
      await UserOpportunityMatch.findOneAndUpdate(
        { userId, opportunityId: opp._id },
        {
          $set: {
            matchScore: score,
            matchedSkills,
            missingSkills,
            matchReasons,
            generatedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log(`Scout completed for user ${userId}`);
};
