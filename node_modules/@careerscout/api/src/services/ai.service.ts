import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';

const ai = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

export interface ExtractedResumeData {
  personal?: {
    fullName?: string;
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  skills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  education: Array<{
    degree: string;
    university: string;
    graduationYear?: number;
    branch?: string;
    cgpa?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
  }>;
  projects: string[];
  certifications: string[];
  preferredRoles: string[];
}

export function heuristicExtractResumeData(resumeText: string): ExtractedResumeData {
  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const fullText = resumeText;

  // 1. Extract personal details from the top lines of the resume
  const personal: ExtractedResumeData['personal'] = {};
  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = fullText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}/);
  const linkedinMatch = fullText.match(/(?:linkedin\.com\/in\/|linkedin\.com\/)([a-zA-Z0-9_-]+)/i);
  const githubMatch = fullText.match(/(?:github\.com\/)([a-zA-Z0-9_-]+)/i);

  if (phoneMatch) personal.phone = phoneMatch[0].trim();
  if (linkedinMatch) personal.linkedinUrl = `https://linkedin.com/in/${linkedinMatch[1]}`;
  if (githubMatch && !githubMatch[1].toLowerCase().includes('github')) {
    personal.githubUrl = `https://github.com/${githubMatch[1]}`;
  }

  // Name is typically on line 1 or 2 before headers
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const rawLine = lines[i];
    // Remove "Linkedin:", "Email:", etc. from first line if concatenated
    const cleanLine = rawLine.split(/(?:Linkedin|Email|GitHub|Phone|Mobile|Tel):/i)[0].trim();
    if (cleanLine.length > 2 && cleanLine.length < 50 && !/resume|curriculum|vitae|page|http/i.test(cleanLine)) {
      personal.fullName = cleanLine;
      break;
    }
  }

  // 2. Technical skills dictionary matching
  const knownLangs = ['Python', 'C++', 'C', 'Java', 'SQL', 'JavaScript', 'TypeScript', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'HTML', 'CSS', 'R', 'Dart', 'Scala'];
  const knownFrameworks = ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Flask', 'Django', 'FastAPI', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'Streamlit', 'Bootstrap', 'Tailwind', 'Keras', 'Spring Boot'];
  const knownDatabases = ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Cassandra', 'Oracle', 'DynamoDB'];
  const knownTools = ['Git', 'GitHub', 'Docker', 'Linux', 'AWS', 'Kubernetes', 'Postman', 'Jira', 'CI/CD'];

  const matchSkills = (dict: string[]) => {
    const found: string[] = [];
    for (const item of dict) {
      const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;:/|()•-])${escaped}(?:$|[\\s,;:/|()•-])`, 'i');
      if (regex.test(fullText)) {
        found.push(item);
      }
    }
    return found;
  };

  const programmingLanguages = matchSkills(knownLangs);
  const frameworks = matchSkills(knownFrameworks);
  const databases = matchSkills(knownDatabases);
  const toolsFound = matchSkills(knownTools);

  const skills = Array.from(new Set([
    ...programmingLanguages,
    ...frameworks,
    ...databases,
    ...toolsFound
  ]));

  // 3. Education parsing
  const education: ExtractedResumeData['education'] = [];
  let inEduSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^EDUCATION\b/i.test(line)) {
      inEduSection = true;
      continue;
    }
    if (inEduSection && /^[A-Z\s]{4,}\b/i.test(line) && !/^(EDUCATION|ACADEMICS)/i.test(line)) {
      // Reached next all-caps section header
      inEduSection = false;
    }

    if (inEduSection || /(university|college|institute|polytechnic)/i.test(line)) {
      if (/(university|college|institute|polytechnic|science college)/i.test(line)) {
        let college = line.replace(/^[•\-\*]\s*/, '').trim();
        // Clean location suffix if present
        college = college.split(/Punjab|India|Latur|Maharashtra|USA|UK/i)[0].trim().replace(/,\s*$/, '');
        
        let degree = 'Bachelor of Technology';
        let gradYear = 2026;
        let branch = 'Computer Science and Engineering';
        let cgpa: string | undefined;

        const context = [line, lines[i + 1] || '', lines[i + 2] || ''].join(' ');
        const degMatch = context.match(/(Bachelor of [^;\n–-]+|Master of [^;\n–-]+|B\.?Tech[^;\n–-]*|Intermediate|B\.?S\.?[^;\n–-]*|M\.?S\.?[^;\n–-]*)/i);
        if (degMatch) degree = degMatch[1].trim();

        const branchMatch = context.match(/(?:Computer Science|Information Technology|Mechanical|Electrical|Civil|Electronics)[^;\n–-]*/i);
        if (branchMatch) branch = branchMatch[0].trim();

        const cgpaMatch = context.match(/(?:CGPA|GPA|Percentage):\s*([\d.]+)/i);
        if (cgpaMatch) cgpa = cgpaMatch[1];

        const yearMatch = context.match(/\b(20[12]\d)\b(?:\s*[\–\-]\s*(20[23]\d))?/);
        if (yearMatch) {
          gradYear = parseInt(yearMatch[2] || yearMatch[1], 10);
        }

        if (college.length > 3 && !education.some(e => e.university.toLowerCase() === college.toLowerCase())) {
          education.push({ degree, university: college, graduationYear: gradYear, branch, cgpa });
        }
      }
    }
  }

  if (education.length === 0) {
    education.push({
      degree: 'Bachelor of Technology',
      university: 'University Graduate',
      graduationYear: 2026,
      branch: 'Computer Science'
    });
  }

  // 4. Projects parsing
  const projects: string[] = [];
  let inProjSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^PROJECTS\b/i.test(line)) {
      inProjSection = true;
      continue;
    }
    if (inProjSection && /^[A-Z\s]{4,}\b/i.test(line) && !/^PROJECTS/i.test(line)) {
      inProjSection = false;
    }
    if (inProjSection) {
      if (/\|\s*(GitHub|Live|Demo)/i.test(line) || /(App|System|Detector|Detection|Checker|Classifier|Platform|Portal|Tracker)\b/i.test(line)) {
        const projName = line.split('|')[0].replace(/^[•\-\*]\s*/, '').trim();
        if (projName.length > 2 && projName.length < 60 && !projects.includes(projName)) {
          projects.push(projName);
        }
      }
    }
  }

  // 5. Experience / Training parsing
  const experience: ExtractedResumeData['experience'] = [];
  let inExpSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(EXPERIENCE|WORK HISTORY|INTERNSHIPS?|TRAINING)\b/i.test(line)) {
      inExpSection = true;
      continue;
    }
    if (inExpSection && /^[A-Z\s]{4,}\b/i.test(line) && !/^(EXPERIENCE|WORK HISTORY|INTERNSHIPS?|TRAINING)/i.test(line)) {
      inExpSection = false;
    }
    if (inExpSection) {
      if (/(Company|Technologies|Solutions|Labs|Schools|Pvt|Ltd|Inc|\()/i.test(line)) {
        const company = line.replace(/^[•\-\*]\s*/, '').split(/\s{2,}|\t|\s+(?=[A-Z][a-z]{2}\s+20\d\d)/)[0].trim();
        const nextLine = lines[i + 1] || '';
        const title = nextLine.replace(/^[•\-\*]\s*/, '').split(/[•–-]/)[0].trim() || 'Software Engineer Intern';
        if (company.length > 2 && !experience.some(e => e.company.toLowerCase() === company.toLowerCase())) {
          experience.push({
            title: title || 'Software Intern',
            company,
            startDate: '2026-06-01',
            endDate: '2026-07-31'
          });
        }
      }
    }
  }

  // 6. Certifications
  const certifications: string[] = [];
  let inCertSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(CERTIFICATES?|CERTIFICATIONS?)\b/i.test(line)) {
      inCertSection = true;
      continue;
    }
    if (inCertSection && /^[A-Z\s]{4,}\b/i.test(line) && !/^(CERTIFICATES?|CERTIFICATIONS?)/i.test(line)) {
      inCertSection = false;
    }
    if (inCertSection && line.length > 3 && !/^\s*•?\s*Covers/i.test(line)) {
      const certName = line.replace(/^[•\-\*]\s*/, '').split(/[\–—]/)[0].trim();
      if (certName && !certifications.includes(certName)) {
        certifications.push(certName);
      }
    }
  }

  // 7. Preferred roles
  const preferredRoles: string[] = [];
  if (frameworks.some(f => ['PyTorch', 'TensorFlow', 'Scikit-learn', 'OpenCV'].includes(f))) {
    preferredRoles.push('Machine Learning Engineer', 'AI/Computer Vision Engineer');
  }
  if (frameworks.some(f => ['React', 'Next.js', 'Flask', 'FastAPI', 'Node.js', 'Express'].includes(f))) {
    preferredRoles.push('Full Stack Developer', 'Software Engineer');
  }
  if (databases.length > 0 && !preferredRoles.includes('Backend Developer')) {
    preferredRoles.push('Backend Developer');
  }
  if (preferredRoles.length === 0) {
    preferredRoles.push('Software Engineer', 'Frontend Developer');
  }

  return {
    personal,
    skills,
    programmingLanguages,
    frameworks,
    databases,
    education,
    experience,
    projects,
    certifications,
    preferredRoles: preferredRoles.slice(0, 3)
  };
}

export const extractResumeData = async (resumeText: string): Promise<ExtractedResumeData> => {
  // If AI_API_KEY is configured and valid, attempt Gemini AI extraction
  if (process.env.AI_API_KEY && !process.env.AI_API_KEY.includes('your_gemini')) {
    try {
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
      
      // Also extract personal info via heuristic overlay if Gemini schema didn't include it
      const heuristicData = heuristicExtractResumeData(resumeText);
      if (heuristicData.personal) {
        json.personal = heuristicData.personal;
      }
      return json;
    } catch (error) {
      console.warn('Gemini AI resume extraction encountered an issue, falling back to heuristic extraction:', error);
    }
  }

  // Resilient heuristic extraction fallback when AI_API_KEY is not configured or external service is down
  return heuristicExtractResumeData(resumeText);
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
            reasons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Array of 2-3 short reasons for the score' },
            missingSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Important technical skills required by the job that the user lacks' },
            recommendation: { type: SchemaType.STRING, description: 'One short sentence of advice on how the user can improve their chances (e.g. what to highlight in cover letter, or what to learn)' }
          },
          required: ['score', 'reasons', 'missingSkills', 'recommendation']
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
    
    Calculate a match score from 0 to 100 based on skill overlap, role fit, and experience.
    Identify any critical missing skills the user should learn, and give one short recommendation on how to stand out.`;

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());
    
    return {
      score: Math.min(100, Math.max(0, json.score)),
      reasons: json.reasons || [],
      missingSkills: json.missingSkills || [],
      recommendation: json.recommendation || ''
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

export const generateCoverLetter = async (profile: any, opportunity: any): Promise<string> => {
  if (!process.env.AI_API_KEY || process.env.AI_API_KEY.includes('your_gemini')) {
    return 'Dear Hiring Manager,\n\nI am very interested in this role. Please see my attached resume.\n\nSincerely,\n[Your Name]';
  }
  
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Write a highly tailored, professional cover letter for the following job opportunity, based on the user's profile.
    
    User Profile:
    ${JSON.stringify({
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education
    })}
    
    Job Opportunity:
    ${JSON.stringify({
      title: opportunity.title,
      company: opportunity.organization,
      description: opportunity.description
    })}
    
    The cover letter should be 3-4 paragraphs:
    1. Introduction (enthusiasm for the role and company).
    2. Body (highlighting 1-2 key skills/experiences from the profile that match the job).
    3. Conclusion (call to action).
    Do not include placeholder addresses at the top. Just start with "Dear Hiring Manager," or the appropriate greeting. Return ONLY the cover letter text, no markdown blocks.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI Cover Letter generation failed:', error);
    return 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the open position at your company. My skills and background make me a great fit for this role.\n\nSincerely,\nCandidate';
  }
};
