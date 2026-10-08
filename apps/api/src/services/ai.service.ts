import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';

const ai = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export const extractResumeData = async (resumeText: string) => {
  try {
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY.includes('your_gemini')) {
      throw new Error('AI_API_KEY is not configured in the environment variables.');
    }

    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            skills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            programmingLanguages: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            frameworks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            databases: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            education: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  degree: { type: SchemaType.STRING },
                  university: { type: SchemaType.STRING },
                  graduationYear: { type: SchemaType.NUMBER }
                },
                required: ['degree', 'university']
              }
            },
            experience: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  company: { type: SchemaType.STRING },
                  startDate: { type: SchemaType.STRING },
                  endDate: { type: SchemaType.STRING }
                },
                required: ['title', 'company', 'startDate']
              }
            },
            projects: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            certifications: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            preferredRoles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ['skills', 'programmingLanguages', 'frameworks', 'databases', 'education', 'experience', 'projects', 'certifications', 'preferredRoles']
        }
      }
    });

    const prompt = `Analyze the following resume text and extract all relevant technical skills, programming languages, frameworks, databases, education history, work experience, projects, certifications, and infer up to 3 preferred job roles based on the experience. Extract the data exactly according to the JSON schema provided.\n\nResume Text:\n${resumeText}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const json = JSON.parse(response.text());
    
    return json;
  } catch (error) {
    console.error('Failed to extract resume data', error);
    throw new Error('AI extraction failed');
  }
};

export const calculateMatchScore = async (profile: any, opportunity: any) => {
  try {
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY.includes('your_gemini')) {
      return deterministicMatch(profile, opportunity);
    }
    
    const model = ai.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER, description: 'Match score between 0 and 100' },
            reasons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Array of 2-3 short reasons for the score' }
          },
          required: ['score', 'reasons']
        }
      }
    });

    const prompt = `Analyze the fit between this user's profile and the job opportunity.
    User Profile:
    ${JSON.stringify({
      skills: profile.skills,
      experience: profile.experience,
      goals: profile.careerGoals,
      location: profile.locationPreferences
    })}
    
    Job Opportunity:
    ${JSON.stringify({
      title: opportunity.title,
      company: opportunity.organization,
      description: opportunity.description,
      skills: opportunity.skills,
      type: opportunity.type,
      location: opportunity.location
    })}
    
    Calculate a match score from 0 to 100 based on skill overlap, role fit, and experience. Return the score and 2-3 brief reasons.`;

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());
    
    return {
      score: Math.min(100, Math.max(0, json.score)),
      reasons: json.reasons || []
    };
  } catch (error) {
    console.error('AI matching failed, falling back to deterministic:', error);
    return deterministicMatch(profile, opportunity);
  }
};

const deterministicMatch = (profile: any, opportunity: any) => {
  // Simple deterministic hybrid matching
  let score = 0;
  
  const extractSkills = (skillCat: any[]) => skillCat ? skillCat.map(s => s.name.toLowerCase()) : [];
  
  const targetSkills = new Set([
    ...extractSkills(profile.skills?.programmingLanguages),
    ...extractSkills(profile.skills?.webDevelopment),
    ...extractSkills(profile.skills?.aiMachineLearning),
    ...extractSkills(profile.skills?.databases),
    ...extractSkills(profile.skills?.devopsCloud)
  ]);

  // 1. Skill Match (35%)
  let matchingSkills = 0;
  (opportunity.skills || []).forEach((s: string) => {
    if (targetSkills.has(s.toLowerCase())) matchingSkills++;
  });
  const skillRatio = (opportunity.skills && opportunity.skills.length) ? matchingSkills / opportunity.skills.length : 1;
  score += skillRatio * 35;

  // 2. Role Match (25%)
  const targetRoles = profile.careerGoals?.targetRoles || [];
  if (targetRoles.some((r: string) => opportunity.title?.toLowerCase().includes(r.toLowerCase()))) {
    score += 25;
  }

  // 3. Location Match (10%)
  const workPrefs = profile.locationPreferences?.workPreference?.map((p: string) => p.toLowerCase()) || [];
  const locPrefs = profile.locationPreferences?.preferredLocations?.map((p: string) => p.toLowerCase()) || [];
  
  if (opportunity.remoteType === 'REMOTE' && workPrefs.includes('remote')) {
    score += 10;
  } else if (locPrefs.some((loc: string) => opportunity.location?.toLowerCase().includes(loc))) {
    score += 10;
  }

  // 4. Experience Match (15%)
  if (profile.hasNoExperience && (opportunity.title?.toLowerCase().includes('intern') || opportunity.title?.toLowerCase().includes('junior') || opportunity.title?.toLowerCase().includes('entry'))) {
    score += 15;
  } else if (!profile.hasNoExperience) {
    score += 15; // Placeholder generic check
  }

  // 5. Preferences (15%)
  const lookingFor = profile.careerGoals?.lookingFor?.map((l: string) => l.toLowerCase()) || [];
  if (opportunity.type === 'INTERNSHIP' && lookingFor.includes('internship')) {
    score += 15;
  } else if (opportunity.type === 'JOB' && lookingFor.includes('job')) {
    score += 15;
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons: [
      `You match ${matchingSkills} of the ${(opportunity.skills || []).length} listed technical skills.`,
      `This role aligns with your preferences.`
    ]
  };
};
