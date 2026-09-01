import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Fail gracefully if key is missing (for environments where it might not be required)
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is missing. Gemini service will run in fallback mode.');
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Extracts structured data from a resume text.
 */
export const extractResumeData = async (resumeText: string) => {
  if (!ai) {
    return { skills: [], languages: [], frameworks: [], databases: [], tools: [], projects: [], experience: [], education: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Extract the following information from this resume:\n\n${resumeText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            databases: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            projects: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience: { type: Type.ARRAY, items: { type: Type.STRING } },
            education: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["skills", "languages", "frameworks", "databases", "tools", "projects", "experience", "education"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini extractResumeData error:', error);
    return { skills: [], languages: [], frameworks: [], databases: [], tools: [], projects: [], experience: [], education: [] };
  }
};

/**
 * Validates and extracts structured information from raw opportunity data.
 */
export const extractOpportunityData = async (rawOpportunity: any) => {
  if (!ai) {
    return { title: rawOpportunity.title, organization: rawOpportunity.org, skills: (rawOpportunity.rawSkills || '').split(','), isValid: true, type: 'Jobs' };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Extract detailed opportunity information from this raw text/JSON: ${JSON.stringify(rawOpportunity)}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            organization: { type: Type.STRING },
            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            isValid: { type: Type.BOOLEAN },
            type: { type: Type.STRING, description: "One of: Jobs, Internships, Hackathons, Webinars, Scholarships" }
          },
          required: ["title", "organization", "skills", "isValid", "type"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini extractOpportunityData error:', error);
    return { title: rawOpportunity.title, organization: rawOpportunity.org, skills: (rawOpportunity.rawSkills || '').split(','), isValid: true, type: 'Jobs' };
  }
};

/**
 * Matches an opportunity against a user profile using specific weights.
 */
export const matchOpportunity = async (userProfile: any, opportunity: any) => {
  if (!ai) {
    return { matchScore: 50, matchedSkills: [], missingSkills: [], strengths: [], recommendation: 'Fallback match' };
  }

  try {
    const promptText = `
    Analyze the match between this user profile and this career opportunity.
    Use the following exact weighting system for the match score (0-100):
    - Skill Match: 40% (Only count skills the user ACTUALLY has in their profile)
    - Role Match: 20%
    - Experience Match: 15%
    - Education Match: 10%
    - Location Match: 10%
    - Preference Match: 5%
    
    User Profile: ${JSON.stringify(userProfile)}
    Opportunity: ${JSON.stringify(opportunity)}
    
    Return the total calculated matchScore, along with matchedSkills, missingSkills (skills in opportunity not in user profile), strengths, and a short recommendation.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: "A score from 0 to 100 calculated using the requested weights." },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendation: { type: Type.STRING }
          },
          required: ["matchScore", "matchedSkills", "missingSkills", "strengths", "recommendation"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini matchOpportunity error:', error);
    return { matchScore: 50, matchedSkills: [], missingSkills: [], strengths: [], recommendation: 'Error processing match.' };
  }
};
