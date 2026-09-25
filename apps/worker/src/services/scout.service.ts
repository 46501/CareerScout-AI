import mongoose from 'mongoose';
// @ts-ignore
import { Opportunity } from '../../api/src/models/Opportunity';
// @ts-ignore
import { CareerProfile } from '../../api/src/models/CareerProfile';
// @ts-ignore
import { UserOpportunityMatch } from '../../api/src/models/UserOpportunityMatch';

export const runPersonalizedScout = async (userId: string) => {
  const profile = await CareerProfile.findOne({ userId });
  if (!profile) throw new Error('Career profile not found for user');

  // Step 1: Generate personalized query rules
  const targetRoles = profile.careerGoals?.targetRoles || [];
  
  const extractSkills = (skillCat: any[]) => skillCat ? skillCat.map((s: any) => s.name) : [];
  
  const targetSkills = [
    ...extractSkills(profile.skills?.programmingLanguages || []),
    ...extractSkills(profile.skills?.webDevelopment || []),
    ...extractSkills(profile.skills?.aiMachineLearning || []),
    ...extractSkills(profile.skills?.databases || []),
    ...extractSkills(profile.skills?.devopsCloud || [])
  ];

  // Step 2: Fetch broad matches from DB
  const broadMatches = await Opportunity.find({ isActive: true });

  // Step 3: Compute localized match score
  for (const opp of broadMatches) {
    let score = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const matchReasons: string[] = [];

    // Evaluate Skills Match (Weight: 50%)
    if (opp.skills && opp.skills.length > 0) {
      let skillHits = 0;
      for (const skill of opp.skills) {
        if (targetSkills.map((s: string) => s.toLowerCase()).includes(skill.toLowerCase())) {
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
    if (targetRoles.length > 0) {
      const isRoleMatch = targetRoles.some((role: string) => opp.title.toLowerCase().includes(role.toLowerCase()));
      if (isRoleMatch) {
        score += 20;
        matchReasons.push(`Title matches your preferred role`);
      }
    } else {
      score += 10;
    }

    // Evaluate Location/Remote (Weight: 15%)
    let locScore = 0;
    const workPrefs = profile.locationPreferences?.workPreference?.map((p: string) => p.toLowerCase()) || [];
    const locPrefs = profile.locationPreferences?.preferredLocations?.map((p: string) => p.toLowerCase()) || [];
    
    if (opp.remoteType === 'REMOTE' && workPrefs.includes('remote')) {
      locScore = 15;
      matchReasons.push('Matches your remote work preference');
    } else if (locPrefs.some((loc: string) => opp.location?.toLowerCase().includes(loc))) {
      locScore = 15;
      matchReasons.push(`Matches your preferred location (${opp.location})`);
    } else {
      locScore = 5; // Partial default
    }
    score += locScore;

    // Evaluate Type (Weight: 15%)
    let typeScore = 0;
    const lookingFor = profile.careerGoals?.lookingFor?.map((l: string) => l.toLowerCase()) || [];
    
    if (opp.type === 'JOB' && lookingFor.includes('job')) {
      typeScore = 15;
      matchReasons.push('Matches your preference for full-time jobs');
    } else if (opp.type === 'INTERNSHIP' && lookingFor.includes('internship')) {
      typeScore = 15;
      matchReasons.push('Matches your preference for internships');
    } else if (lookingFor.length === 0) {
      typeScore = 7;
    }
    score += typeScore;

    score = Math.min(Math.round(score), 100);

    // Step 4: Upsert UserOpportunityMatch
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
