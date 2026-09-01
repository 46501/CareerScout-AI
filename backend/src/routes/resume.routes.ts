import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middleware/auth.middleware';
import { extractResumeData } from '../services/geminiService';
import User from '../models/User';
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

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
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text;
    } else {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxData.value;
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from the document.' });
    }

    // Call Gemini to parse structured data
    const resumeData = await extractResumeData(extractedText);

    // Update user profile in MongoDB
    const user = await User.findById(req.user.userId);
    if (user) {
      const updatedProfile = {
        ...user.profile,
        skills: Array.from(new Set([...(user.profile?.skills || []), ...(resumeData.skills || [])])),
        languages: Array.from(new Set([...(user.profile?.languages || []), ...(resumeData.languages || [])])),
        tools: Array.from(new Set([...(user.profile?.tools || []), ...(resumeData.tools || [])])),
        education: resumeData.education?.length ? resumeData.education.map((e: string) => ({ institution: e, degree: '', year: '' })) : user.profile?.education,
        experience: resumeData.experience?.length ? resumeData.experience.map((e: string) => ({ company: e, role: '', duration: '' })) : user.profile?.experience,
      };

      // Simple dynamic completion calculation
      let completionPercentage = 0;
      let completedFields = 0;
      const totalFields = 10;
      
      if (updatedProfile.phone) completedFields++;
      if (updatedProfile.location) completedFields++;
      if (updatedProfile.bio) completedFields++;
      if (updatedProfile.education?.length) completedFields++;
      if (updatedProfile.experience?.length) completedFields++;
      if (updatedProfile.projects?.length) completedFields++;
      if (updatedProfile.skills?.length) completedFields++;
      if (updatedProfile.languages?.length) completedFields++;
      if (updatedProfile.tools?.length) completedFields++;
      if (updatedProfile.preferences?.roles?.length || updatedProfile.preferences?.workMode) completedFields++;
      
      completionPercentage = Math.round((completedFields / totalFields) * 100);

      await User.findByIdAndUpdate(req.user.userId, {
        $set: {
          profile: updatedProfile,
          completionPercentage,
          profileCompleted: completionPercentage > 0
        }
      });
    }

    res.json({ 
      message: 'Resume analyzed successfully.', 
      data: {
        name: user?.name || 'User',
        email: user?.email || '',
        phone: user?.profile?.phone || '',
        ...resumeData
      }
    });

    // Optionally cleanup file to save space
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: 'Something went wrong during file upload or analysis. Please try again.' });
  }
});

export default router;
