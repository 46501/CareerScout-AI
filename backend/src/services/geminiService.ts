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

/**
 * Generates an advanced, ATS-style analysis of a resume.
 * Optionally compares against a target job description.
 */
export const generateAdvancedResumeAnalysis = async (resumeText: string, jobDescription?: string) => {
  if (!ai) {
    throw new Error('Gemini AI is not configured.');
  }

  let contents = `Analyze this resume in detail as an expert career coach and ATS system.
Resume Text:
"""
${resumeText}
"""
`;

  if (jobDescription) {
    contents += `
Target Job Description:
"""
${jobDescription}
"""
Include a detailed job match analysis.
`;
  }

  const schemaProperties: any = {
    contentQualityScore: { type: Type.INTEGER, description: 'Score from 0 to 20 assessing bullet point impact and actionable language.' },
    impactScore: { type: Type.INTEGER, description: 'Score from 0 to 20 assessing measurable outcomes and metrics in the resume.' },
    bulletQuality: {
      type: Type.OBJECT,
      properties: {
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    skillStrength: {
      type: Type.OBJECT,
      properties: {
        strong: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Skills with strong evidence.' },
        moderate: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Skills with some evidence.' },
        weak: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Skills merely mentioned.' }
      }
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Top 3-5 strengths of the resume.' },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Top 3-5 weaknesses or areas for improvement.' },
    topImprovements: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Top 3-5 prioritized actionable improvement steps.' },
    roadmap: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A 3-5 step career improvement roadmap.' },
    keywords: {
      type: Type.OBJECT,
      properties: {
        matched: { type: Type.ARRAY, items: { type: Type.STRING } },
        missing: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  };

  if (jobDescription) {
    schemaProperties.jobMatch = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: 'Match score from 0-100.' },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        explanation: { type: Type.STRING }
      },
      required: ['score', 'strengths', 'weaknesses', 'explanation']
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: [
            'contentQualityScore', 'impactScore', 'bulletQuality', 'skillStrength',
            'strengths', 'weaknesses', 'topImprovements', 'roadmap', 'keywords'
          ]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini generateAdvancedResumeAnalysis error:', error);
    throw new Error('Failed to generate advanced resume analysis.');
  }
};
