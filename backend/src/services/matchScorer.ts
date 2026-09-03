export const calculateHeuristicMatchScore = (userProfile: any, opportunity: any): number => {
  if (!userProfile) return 50; // Default if no profile

  let score = 0;
  const maxScore = 100;

  // 1. Skill Match (40 points)
  // Check how many of the opportunity's skills are in the user's skills
  const oppSkills = opportunity.skills || [];
  const userSkillsStr = Array.isArray(userProfile.skills) 
    ? userProfile.skills.join(' ').toLowerCase() 
    : (userProfile.skills || '').toString().toLowerCase();
  
  if (oppSkills.length > 0) {
    let matchedSkills = 0;
    oppSkills.forEach((skill: string) => {
      if (userSkillsStr.includes(skill.toLowerCase())) {
        matchedSkills++;
      }
    });
    // Calculate percentage of matched skills, max 40 points
    const skillScore = (matchedSkills / oppSkills.length) * 40;
    score += skillScore;
  } else {
    // If opportunity has no specific skills listed, give partial credit to avoid penalizing
    score += 20; 
  }

  // 2. Role Match (20 points)
  // Check if target role matches the title
  const targetRole = (userProfile.targetRole || '').toLowerCase();
  const title = (opportunity.title || '').toLowerCase();
  if (targetRole && title.includes(targetRole)) {
    score += 20;
  } else if (targetRole) {
    // Partial check (e.g. "Software Engineer" vs "Senior Backend Engineer")
    const roleWords = targetRole.split(' ').filter((w: string) => w.length > 3);
    const titleWords = title.split(' ');
    const hasOverlap = roleWords.some((w: string) => title.includes(w));
    if (hasOverlap) score += 10;
  } else {
    score += 10; // Neutral if no target role set
  }

  // 3. Experience Match (15 points)
  // Simplified check: if opportunity says "senior" but user is "entry", penalize.
  const oppExperience = (opportunity.experienceLevel || '').toLowerCase();
  const userExperience = (userProfile.experienceLevel || '').toLowerCase();
  
  if (!oppExperience || oppExperience === 'not specified') {
    score += 15;
  } else if (userExperience) {
    if (userExperience === oppExperience) {
      score += 15;
    } else if (userExperience.includes('senior') && !oppExperience.includes('entry')) {
      score += 10; // Senior can do mid/junior
    } else if (userExperience.includes('entry') && oppExperience.includes('senior')) {
      score += 0; // Entry shouldn't do senior
    } else {
      score += 5; // Partial match for other mismatches
    }
  } else {
    score += 10;
  }

  // 4. Location Match (15 points)
  const oppLocation = (opportunity.location || '').toLowerCase();
  const userCountry = (userProfile.country || '').toLowerCase();
  const oppWorkMode = (opportunity.workMode || '').toLowerCase();
  const userWorkMode = (userProfile.workMode || '').toLowerCase();

  // If remote, it's generally a location match
  if (oppWorkMode.includes('remote') || oppLocation.includes('remote') || oppLocation.includes('anywhere')) {
    score += 15;
  } else if (userCountry && oppLocation.includes(userCountry)) {
    score += 15;
  } else {
    score += 5; // Maybe willing to relocate
  }

  // 5. Preference Match (10 points)
  // Type of opportunity (Jobs, Internships, etc.)
  const oppType = (opportunity.type || '').toLowerCase();
  const userGoal = (userProfile.careerGoal || '').toLowerCase(); // e.g. "Full-time Job", "Internship"
  
  if (userGoal && userGoal.includes(oppType)) {
    score += 10;
  } else if (userGoal === 'freelance/contract' && oppType === 'jobs') {
    score += 5;
  } else if (!userGoal) {
    score += 5;
  }

  // Add slight randomization (+- 3 points) to break ties if everything is perfect, ensuring dynamic look
  const variance = Math.floor(Math.random() * 6) - 3; 
  score = Math.max(0, Math.min(100, score + variance));

  return Math.round(score);
};
