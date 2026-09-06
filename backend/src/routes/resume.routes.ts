import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.middleware';
import { extractResumeData, generateAdvancedResumeAnalysis } from '../services/geminiService';
import User from '../models/User';
// Use require() for pdf-parse v2 to bypass ts-node type-checking issue (TS2349)
// The module works correctly at runtime but its .d.cts types conflict with nodenext resolution
const { PDFParse } = require('pdf-parse') as { PDFParse: any };
import * as mammoth from 'mammoth';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/')); // Requires creating 'uploads' dir
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Sanitize filename and prevent path traversal
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + safeName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const calculateDeterministicScores = (extractedText: string, basicData: any) => {
  const textLower = extractedText.toLowerCase();
  
  // ATS Readiness (Max 20)
  let atsScore = 0;
  if (textLower.includes('experience') || textLower.includes('work history')) atsScore += 5;
  if (textLower.includes('education')) atsScore += 5;
  if (textLower.includes('skills')) atsScore += 5;
  if (textLower.includes('@') && /\d{10}/.test(textLower)) atsScore += 5; // Email + Phone roughly

  // Structure Score (Max 20)
  let structureScore = 0;
  if (basicData.experience && basicData.experience.length > 0) structureScore += 5;
  if (basicData.education && basicData.education.length > 0) structureScore += 5;
  if (basicData.projects && basicData.projects.length > 0) structureScore += 5;
  if (basicData.skills && basicData.skills.length > 0) structureScore += 5;

  return { atsScore, structureScore };
};

router.post('/upload', authMiddleware, upload.single('resume'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    }

    const { targetJobDescription } = req.body; // Optional field for job matching

    const filePath = path.join(__dirname, '../../uploads/', req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: fileBuffer });
      const pdfData = await parser.getText();
      extractedText = pdfData.text;
      await parser.destroy();
    } else {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxData.value;
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the document.' });
    }

    // Call Gemini to parse structured data
    const resumeData = await extractResumeData(extractedText);
    
    // Call Gemini to generate advanced analysis
    const advancedAnalysis = await generateAdvancedResumeAnalysis(extractedText, targetJobDescription);

    // Calculate deterministic scores
    const { atsScore, structureScore } = calculateDeterministicScores(extractedText, resumeData);

    const overallScore = Math.round(
      atsScore + 
      structureScore + 
      (advancedAnalysis.contentQualityScore || 0) + 
      (advancedAnalysis.impactScore || 0) +
      20 // Assuming skills score maxes at 20 deterministically for presence, can refine
    );

    const fullAnalysis = {
      overallScore: Math.min(overallScore, 100),
      breakdown: {
        ats: atsScore,
        structure: structureScore,
        content: advancedAnalysis.contentQualityScore || 0,
        impact: advancedAnalysis.impactScore || 0,
        skills: 20
      },
      ...advancedAnalysis
    };

    // Save resume metadata to MongoDB without overwriting other profile fields
    const user = await User.findById(req.user.userId || req.user.id);
    if (user) {
      // Use Object.keys to dynamically set only the extracted data without wiping existing
      const profileUpdates: any = {};
      if (resumeData.skills?.length > 0) profileUpdates['profile.skills'] = resumeData.skills;
      if (resumeData.languages?.length > 0) profileUpdates['profile.languages'] = resumeData.languages;
      if (resumeData.tools?.length > 0) profileUpdates['profile.tools'] = resumeData.tools;

      await User.findByIdAndUpdate(user._id, {
        $set: {
          'profile.resume.filename': req.file.originalname,
          'profile.resume.path': req.file.filename,
          'profile.resume.uploadedAt': new Date(),
          'profile.resume.extractedText': extractedText,
          'profile.resume.analysis': fullAnalysis,
          ...profileUpdates
        }
      });
    }

    res.json({ 
      message: 'Resume uploaded and analyzed successfully.', 
      data: {
        extractedData: resumeData,
        analysis: fullAnalysis
      }
    });

    // Cleanup file
    fs.unlinkSync(filePath);

  } catch (error: any) {
    console.error('Resume upload error:', error);
    
    if (error.name === 'InvalidPDFException' || error.message?.includes('Invalid PDF structure') || error.message?.includes('PDF')) {
      return res.status(400).json({ error: 'Invalid PDF file. Please upload a valid document.' });
    }
    if (error.message?.includes('unzip')) {
       return res.status(400).json({ error: 'Invalid DOCX file. Please upload a valid document.' });
    }
    res.status(500).json({ error: 'Something went wrong during file upload or analysis. Please try again.' });
  }
});

router.post('/analyze-saved', authMiddleware, async (req: any, res) => {
  try {
    const { targetJobDescription } = req.body;
    
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user || !user.profile?.resume?.extractedText) {
      return res.status(400).json({ error: 'No saved resume found. Please upload a resume first.' });
    }

    const extractedText = user.profile.resume.extractedText;

    // Call Gemini to parse structured data
    const resumeData = await extractResumeData(extractedText);
    
    // Call Gemini to generate advanced analysis
    const advancedAnalysis = await generateAdvancedResumeAnalysis(extractedText, targetJobDescription);

    // Calculate deterministic scores
    const { atsScore, structureScore } = calculateDeterministicScores(extractedText, resumeData);

    const overallScore = Math.round(
      atsScore + 
      structureScore + 
      (advancedAnalysis.contentQualityScore || 0) + 
      (advancedAnalysis.impactScore || 0) +
      20 
    );

    const fullAnalysis = {
      overallScore: Math.min(overallScore, 100),
      breakdown: {
        ats: atsScore,
        structure: structureScore,
        content: advancedAnalysis.contentQualityScore || 0,
        impact: advancedAnalysis.impactScore || 0,
        skills: 20
      },
      ...advancedAnalysis
    };

    await User.findByIdAndUpdate(user._id, {
      $set: {
        'profile.resume.analysis': fullAnalysis
      }
    });

    res.json({
      message: 'Resume re-analyzed successfully.',
      data: {
        extractedData: resumeData,
        analysis: fullAnalysis
      }
    });

  } catch (error) {
    console.error('Re-analyze error:', error);
    res.status(500).json({ error: 'Failed to re-analyze resume.' });
  }
});

export default router;
