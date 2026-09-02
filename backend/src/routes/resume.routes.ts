import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.middleware';
import { extractResumeData } from '../services/geminiService';
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

router.post('/upload', authMiddleware, upload.single('resume'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    }

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

    // Save resume metadata to MongoDB without overwriting other profile fields
    const user = await User.findById(req.user.userId || req.user.id);
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'profile.resume': {
            filename: req.file.originalname,
            path: req.file.filename,
            uploadedAt: new Date()
          }
        }
      });
    }

    res.json({ 
      message: 'Resume uploaded and analyzed successfully.', 
      data: {
        extractedData: resumeData
      }
    });

    // Optionally cleanup file to save space
    fs.unlinkSync(filePath);

  } catch (error: any) {
    console.error('Resume upload error:', error);
    
    // Handle invalid PDF files gracefully by returning a 400 instead of 500
    if (error.name === 'InvalidPDFException' || error.message?.includes('Invalid PDF structure') || error.message?.includes('PDF')) {
      return res.status(400).json({ error: 'Invalid PDF file. Please upload a valid document.' });
    }
    
    // Handle mammoth errors
    if (error.message?.includes('unzip')) {
       return res.status(400).json({ error: 'Invalid DOCX file. Please upload a valid document.' });
    }

    res.status(500).json({ error: 'Something went wrong during file upload or analysis. Please try again.' });
  }
});

export default router;
