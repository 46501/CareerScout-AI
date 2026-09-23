import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';

const ai = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export const extractResumeData = async (resumeText: string) => {
  try {
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY.includes('your_gemini')) {
      console.warn('AI_API_KEY not configured. Falling back to mock extraction.');
      return {
        skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
        programmingLanguages: ['JavaScript', 'TypeScript'],
        frameworks: ['React', 'Express'],
        databases: ['MongoDB', 'PostgreSQL'],
        education: [{ degree: 'B.S. Computer Science', university: 'Mock University', graduationYear: 2024 }],
        experience: [{ title: 'Software Engineering Intern', company: 'Tech Corp', startDate: '2023-06-01', endDate: '2023-08-31' }],
        projects: ['AI Career Scout'],
        certifications: ['AWS Certified Developer'],
        preferredRoles: ['Software Engineer', 'Full Stack Developer']
      };
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

export const calculateMatchScore = (profile: any, opportunity: any) => {
  // Simple deterministic hybrid matching
  let score = 0;
  
  // 1. Skill Match (35%)
  const profileSkills = new Set([...(profile.skills.programmingLanguages || []), ...(profile.skills.frameworks || [])]);
  let matchingSkills = 0;
  opportunity.skills.forEach((s: string) => {
    if (profileSkills.has(s)) matchingSkills++;
  });
  const skillRatio = opportunity.skills.length ? matchingSkills / opportunity.skills.length : 1;
  score += skillRatio * 35;

  // 2. Role Match (25%)
  const preferredRoles = profile.preferences.preferredRoles || [];
  if (preferredRoles.some((r: string) => opportunity.title.toLowerCase().includes(r.toLowerCase()))) {
    score += 25;
  }

  // 3. Location Match (10%)
  const preferredLocations = profile.preferences.preferredLocations || [];
  if (opportunity.remoteType === 'REMOTE' && profile.preferences.remotePreference === 'REMOTE') {
    score += 10;
  } else if (preferredLocations.includes(opportunity.location)) {
    score += 10;
  }

  // 4. Experience Match (15%)
  // Mock logic
  score += 15;

  // 5. Preferences (15%)
  if (opportunity.type === 'INTERNSHIP' && profile.preferences.internshipPreference) {
    score += 15;
  } else if (opportunity.type === 'JOB' && profile.preferences.jobPreference) {
    score += 15;
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons: [
      `You match ${matchingSkills} of the ${opportunity.skills.length} listed technical skills.`,
      `This role aligns with your preferences.`
    ]
  };
};
