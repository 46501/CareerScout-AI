import { Response } from 'express';
import { Resume } from '../models/Resume';
import { AuthRequest } from '../middleware/auth.middleware';

export const uploadResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }

    // Abstract storage (we use local file path here for development)
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const resume = await Resume.create({
      userId: req.user?.id,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      status: 'PENDING'
    });

    res.status(201).json({ success: true, data: resume, message: 'Resume uploaded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const getResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resume = await Resume.findOne({ userId: req.user?.id }).sort({ createdAt: -1 });
    
    if (!resume) {
      res.status(404).json({ success: false, error: { message: 'Resume not found' } });
      return;
    }

    res.status(200).json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};

export const confirmResumeExtraction = async (req: AuthRequest, res: Response): Promise<void> => {
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
    res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};
