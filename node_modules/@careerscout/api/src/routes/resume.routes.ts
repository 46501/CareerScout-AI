import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadResume, getResume, confirmResumeExtraction } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      return cb(new Error('Only PDF and DOCX files are allowed'));
    }
    cb(null, true);
  }
});

router.use(authenticate);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResume);
router.post('/confirm', confirmResumeExtraction);

export default router;
