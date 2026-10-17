import { NextFunction, Response } from 'express';
import { Resume } from '../models/Resume';
import { CareerProfile } from '../models/CareerProfile';
import { AuthRequest } from '../middleware/auth.middleware';
import fs from 'fs/promises';
import path from 'path';

// Polyfills for pdf-parse/pdfjs-dist in Node 22+
if (typeof global !== 'undefined') {
  if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix {
      constructor() { return this; }
    } as any;
  }
  if (!global.Path2D) {
    global.Path2D = class Path2D {
      constructor() { return this; }
    } as any;
  }
}

const mammoth = require('mammoth');
import { extractResumeData } from '../services/ai.service';
import { publishUserEvent } from '../services/pubsub.service';

/**
 * Robust text extractor for PDF documents that supports both pdf-parse v1 (function)
 * and pdf-parse v2+ (PDFParse class).
 */
async function extractTextFromPdf(dataBuffer: Buffer): Promise<string> {
  const pdfParseLib = require('pdf-parse');
  let text = '';

  if (typeof pdfParseLib === 'function') {
    const data = await pdfParseLib(dataBuffer);
    text = data?.text || '';
  } else {
    const ParserClass = pdfParseLib.PDFParse || pdfParseLib.default?.PDFParse || pdfParseLib.default;
    if (typeof ParserClass === 'function') {
      try {
        const parser = new ParserClass({ data: dataBuffer });
        const result = await parser.getText();
        text = result?.text || '';
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      } catch (err: any) {
        if (err instanceof TypeError && err.message.includes('not a constructor')) {
          const data = await ParserClass(dataBuffer);
          text = data?.text || '';
        } else {
          throw err;
        }
      }
    } else {
      throw new Error('Unsupported pdf-parse module format in current environment');
    }
  }

  if (!text || text.trim().length === 0) {
    throw new Error('No readable text found in document. Scanned or image-only documents are not supported.');
  }

  return text;
}

export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Create initial resume record with PROCESSING status
    let resume = await Resume.findOneAndUpdate(
      { userId: req.user?.id },
      {
        fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        status: 'PROCESSING',
        $unset: { error: 1 }
      },
      { upsert: true, new: true, sort: { createdAt: -1 } }
    );

    res.status(201).json({ 
      success: true, 
      data: resume, 
      message: 'Resume uploaded and processing started' 
    });

    // Process asynchronously without blocking response
    try {
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      const dataBuffer = await fs.readFile(filePath);
      
      let text = '';
      if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
        text = await extractTextFromPdf(dataBuffer);
      } else if (
        req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        req.file.originalname.toLowerCase().endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        text = result.value || '';
        if (!text.trim()) {
          throw new Error('No readable text found in DOCX file.');
        }
      } else {
        text = dataBuffer.toString('utf-8');
      }

      const extractedData = await extractResumeData(text);
      
      await Resume.findByIdAndUpdate(resume._id, {
        parsedData: extractedData,
        status: 'EXTRACTED',
        $unset: { error: 1 },
        aiDetected: {
          skillsCount: extractedData.skills?.length || 0,
          eduCount: extractedData.education?.length || 0,
          expCount: extractedData.experience?.length || 0
        }
      });

      // Broadcast real-time success to frontend
      if (req.user?.id) {
        await publishUserEvent(req.user.id, {
          type: 'RESUME_PARSED',
          status: 'SUCCESS',
          data: extractedData
        });
      }

    } catch (processErr: any) {
      console.error('Resume processing error:', processErr?.message || processErr);
      const errorMessage = processErr?.message || 'Could not parse resume data.';
      
      await Resume.findByIdAndUpdate(resume._id, { 
        status: 'FAILED',
        error: errorMessage
      });
      
      // Broadcast real-time error to frontend
      if (req.user?.id) {
        await publishUserEvent(req.user.id, {
          type: 'RESUME_PARSED',
          status: 'FAILED',
          error: errorMessage
        });
      }
    }

  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

export const getResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await Resume.findOne({ userId: req.user?.id }).sort({ createdAt: -1 });
    
    if (!resume) {
      res.status(404).json({ success: false, error: { message: 'Resume not found' } });
      return;
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    next(error);
  }
};

export const confirmResumeExtraction = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { parsedData } = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { userId, status: 'EXTRACTED' },
      { ...(parsedData ? { parsedData } : {}), status: 'CONFIRMED' },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!resume) {
      res.status(404).json({ success: false, error: { message: 'No extracted resume found to confirm' } });
      return;
    }

    // Merge extracted data into CareerProfile
    const dataToMerge = parsedData || resume.parsedData;
    if (dataToMerge) {
      let profile = await CareerProfile.findOne({ userId });
      if (!profile) {
        profile = new CareerProfile({ userId });
      }

      // Merge personal info if missing
      if (dataToMerge.personal) {
        profile.personal = profile.personal || ({} as any);
        if (!profile.personal.fullName && dataToMerge.personal.fullName) {
          profile.personal.fullName = dataToMerge.personal.fullName;
        }
        if (!profile.personal.phone && dataToMerge.personal.phone) {
          profile.personal.phone = dataToMerge.personal.phone;
        }
        if (!profile.personal.linkedinUrl && dataToMerge.personal.linkedinUrl) {
          profile.personal.linkedinUrl = dataToMerge.personal.linkedinUrl;
        }
        if (!profile.personal.githubUrl && dataToMerge.personal.githubUrl) {
          profile.personal.githubUrl = dataToMerge.personal.githubUrl;
        }
      }

      // Merge skills without duplicates
      profile.skills = profile.skills || {
        programmingLanguages: [],
        webDevelopment: [],
        aiMachineLearning: [],
        databases: [],
        devopsCloud: []
      };

      const addSkills = (targetList: Array<{ name: string; level?: string }>, names: string[]) => {
        const existing = new Set(targetList.map(s => s.name.toLowerCase()));
        for (const name of names) {
          if (!existing.has(name.toLowerCase())) {
            targetList.push({ name, level: 'Intermediate' });
            existing.add(name.toLowerCase());
          }
        }
      };

      if (Array.isArray(dataToMerge.programmingLanguages)) {
        addSkills(profile.skills.programmingLanguages, dataToMerge.programmingLanguages);
      }
      if (Array.isArray(dataToMerge.frameworks)) {
        const webFws = dataToMerge.frameworks.filter((f: string) => 
          /react|next|vue|angular|node|express|flask|django|fastapi|bootstrap|tailwind/i.test(f)
        );
        const aiFws = dataToMerge.frameworks.filter((f: string) => 
          /pytorch|tensorflow|scikit|opencv|keras|streamlit/i.test(f)
        );
        addSkills(profile.skills.webDevelopment, webFws);
        addSkills(profile.skills.aiMachineLearning, aiFws);
      }
      if (Array.isArray(dataToMerge.databases)) {
        addSkills(profile.skills.databases, dataToMerge.databases);
      }

      // Merge education if missing or add non-duplicate entries
      if (Array.isArray(dataToMerge.education) && dataToMerge.education.length > 0) {
        profile.education = profile.education || [];
        for (const edu of dataToMerge.education) {
          const collegeName = edu.university || edu.college || 'University';
          const exists = profile.education.some(e => e.college.toLowerCase() === collegeName.toLowerCase());
          if (!exists) {
            profile.education.push({
              college: collegeName,
              degree: edu.degree || 'Bachelor of Technology',
              branch: edu.branch || 'Computer Science',
              startYear: edu.startYear || (edu.graduationYear ? edu.graduationYear - 4 : 2022),
              graduationYear: edu.graduationYear || 2026,
              cgpa: edu.cgpa || ''
            });
          }
        }
      }

      // Merge experience without duplicates
      if (Array.isArray(dataToMerge.experience) && dataToMerge.experience.length > 0) {
        profile.experience = profile.experience || [];
        for (const exp of dataToMerge.experience) {
          const exists = profile.experience.some(e => 
            e.company.toLowerCase() === exp.company.toLowerCase() && 
            e.title.toLowerCase() === exp.title.toLowerCase()
          );
          if (!exists) {
            profile.experience.push({
              company: exp.company,
              title: exp.title,
              employmentType: 'Full-time',
              startDate: exp.startDate ? new Date(exp.startDate) : new Date('2026-01-01'),
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
              currentlyWorking: !exp.endDate,
              technologiesUsed: dataToMerge.skills?.slice(0, 5) || []
            });
          }
        }
      }

      // Merge preferredRoles into careerGoals.targetRoles
      if (Array.isArray(dataToMerge.preferredRoles) && dataToMerge.preferredRoles.length > 0) {
        profile.careerGoals = profile.careerGoals || {
          lookingFor: ['Internship', 'Full-time'],
          targetRoles: [],
          interestedTechnologies: [],
          careerInterests: []
        };
        const existingRoles = new Set((profile.careerGoals.targetRoles || []).map((r: string) => r.toLowerCase()));
        for (const role of dataToMerge.preferredRoles) {
          if (!existingRoles.has(role.toLowerCase())) {
            profile.careerGoals.targetRoles.push(role);
            existingRoles.add(role.toLowerCase());
          }
        }
      }

      await profile.save();
    }

    res.status(200).json({ 
      success: true, 
      data: resume, 
      message: 'Resume extraction confirmed and merged into profile' 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await Resume.findOneAndDelete({ userId: req.user?.id });
    if (!resume) {
      res.status(404).json({ success: false, error: { message: 'Resume not found' } });
      return;
    }

    try {
      if (resume.fileUrl) {
        const filePath = path.join(process.cwd(), resume.fileUrl.replace(/^\//, ''));
        await fs.unlink(filePath).catch(() => {});
      }
    } catch (e) {}

    res.status(200).json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};
