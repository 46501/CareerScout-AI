import { NextFunction } from 'express';
import { Response } from 'express';
import { Resume } from '../models/Resume';
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

const pdfParseLib = require('pdf-parse');
const pdfParse = typeof pdfParseLib === 'function' ? pdfParseLib : (pdfParseLib.default || pdfParseLib.PDFParse || pdfParseLib);
const mammoth = require('mammoth');
import { extractResumeData } from '../services/ai.service';
import { publishUserEvent } from '../services/pubsub.service';

export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Create initial resume record
    let resume = await Resume.findOneAndUpdate(
      { userId: req.user?.id },
      {
        fileUrl,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        status: 'PROCESSING'
      },
      { upsert: true, new: true, sort: { createdAt: -1 } }
    );

    res.status(201).json({ success: true, data: resume, message: 'Resume uploaded and processing started' });

    // Process asynchronously
    try {
      const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
      const dataBuffer = await fs.readFile(filePath);
      
      let text = '';
      if (req.file.mimetype === 'application/pdf') {
        const data = await pdfParse(dataBuffer);
        text = data.text;
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        text = result.value;
      } else {
        // Fallback for docx or other formats if needed, for MVP we'll just extract raw text if possible
        text = dataBuffer.toString('utf-8');
      }

      const extractedData = await extractResumeData(text);
      
      await Resume.findByIdAndUpdate(resume._id, {
        parsedData: extractedData,
        status: 'EXTRACTED',
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

    } catch (processErr) {
      console.error('Resume processing error:', processErr);
      await Resume.findByIdAndUpdate(resume._id, { status: 'FAILED' });
      
      // Broadcast real-time error to frontend
      if (req.user?.id) {
        await publishUserEvent(req.user.id, {
          type: 'RESUME_PARSED',
          status: 'FAILED',
          error: 'Could not parse resume data.'
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
    const { parsedData } = req.body;
    
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user?.id, status: 'EXTRACTED' },
      { parsedData, status: 'CONFIRMED' },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!resume) {
      res.status(404).json({ success: false, error: { message: 'No extracted resume found' } });
      return;
    }

    res.status(200).json({ success: true, data: resume, message: 'Resume extraction confirmed' });
  } catch (error) {
    next(error);
  }
};
