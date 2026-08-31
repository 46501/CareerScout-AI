import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Opportunity from './models/Opportunity';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerscout';

const seedOpportunities = [
  {
    title: 'Full Stack Development Intern',
    organization: 'Women First India Foundation',
    logo: 'https://ui-avatars.com/api/?name=WF&background=random',
    type: 'Internships',
    description: 'Build and maintain responsive web applications using HTML, CSS, JavaScript; optimize performance and ensure best practices.',
    location: 'Remote',
    workMode: 'Work from home',
    paymentType: 'Unpaid',
    duration: '1 Month',
    experienceLevel: 'Entry Level',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Responsive Design'],
    postedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    source: 'LinkedIn',
    matchScore: 94,
    isVerified: true,
    isNewOpp: true,
    earlyApplicant: true,
  },
  {
    title: 'AI Data Analytics Intern',
    organization: 'InAmigos Foundation',
    logo: 'https://ui-avatars.com/api/?name=IA&background=random',
    type: 'Internships',
    description: 'Assist with data collection, analysis, and dashboard creation for reports and organizational insights.',
    location: 'Remote',
    workMode: 'Work from home',
    paymentType: 'Unpaid',
    duration: '2 Weeks',
    experienceLevel: 'Entry Level',
    skills: ['Python', 'Data Analysis', 'Excel', 'SQL', 'Tableau', 'PowerBI'],
    postedAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    source: 'Wellfound',
    matchScore: 91,
    isVerified: true,
    isNewOpp: true,
    earlyApplicant: true,
  },
  {
    title: 'Application Engineer',
    organization: 'Senso Vision System',
    logo: 'https://ui-avatars.com/api/?name=SV&background=random',
    type: 'Jobs',
    description: 'Evaluate customer requirements, develop turnkey machine vision solutions, and select lighting and imaging components.',
    location: 'Bangalore',
    workMode: 'On-site',
    paymentType: 'Paid',
    salary: '₹5,000 - 10,000 /month',
    duration: '3 Months',
    experienceLevel: 'Mid Level',
    skills: ['Machine Vision', 'OpenCV', 'Python', 'Troubleshooting', 'C++'],
    postedAt: new Date(Date.now() - 3600000 * 24 * 7), // 1 week ago
    source: 'Indeed',
    matchScore: 87,
    isVerified: false,
    isNewOpp: false,
    earlyApplicant: false,
  },
  {
    title: 'Global Hackathon 2026',
    organization: 'DevFolio',
    logo: 'https://ui-avatars.com/api/?name=DF&background=random',
    type: 'Hackathons',
    description: 'Join the biggest global hackathon. Build innovative AI solutions over 48 hours.',
    location: 'Remote',
    workMode: 'Work from home',
    paymentType: 'Unpaid',
    duration: '2 Days',
    experienceLevel: 'All Levels',
    skills: ['AI', 'React', 'Node.js', 'Hackathon'],
    postedAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago
    source: 'Devfolio',
    matchScore: 95,
    isVerified: true,
    isNewOpp: true,
    earlyApplicant: false,
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB...');
    
    await Opportunity.deleteMany({});
    console.log('Cleared existing opportunities.');

    await Opportunity.insertMany(seedOpportunities);
    console.log('Successfully seeded 4 opportunities.');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedDB();
