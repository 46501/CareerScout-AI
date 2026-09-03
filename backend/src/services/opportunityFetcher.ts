import axios from 'axios';
import Opportunity from '../models/Opportunity';
import LanguageDetect from 'languagedetect';

const lngDetector = new LanguageDetect();

const isRelevantOpportunity = (title: string, description: string, location: string): boolean => {
  const text = `${title} ${description}`.substring(0, 1000);
  
  if (text.trim().length > 20) {
    const detectedLanguages = lngDetector.detect(text, 3);
    if (detectedLanguages && detectedLanguages.length > 0) {
      const firstMatch = detectedLanguages[0];
      if (firstMatch && firstMatch.length > 0) {
        const topLanguage = firstMatch[0];
        const rejectedLangs = ['german', 'french', 'spanish', 'dutch', 'italian', 'portuguese', 'polish'];
        
        if (rejectedLangs.includes(topLanguage as string)) {
          return false;
        }
      }
    }
  }

  // Filter out purely local foreign jobs (if not remote)
  const loc = location ? location.toLowerCase() : '';
  const isRemoteOrGlobal = loc.includes('remote') || loc.includes('anywhere') || loc.includes('global') || loc.includes('worldwide');
  if (isRemoteOrGlobal) return true;
  
  const blockList = ['germany', 'berlin', 'munich', 'münchen', 'hamburg', 'frankfurt', 'france', 'paris', 'spain', 'madrid', 'barcelona', 'netherlands', 'amsterdam', 'switzerland', 'austria', 'vienna'];
  for (const blocked of blockList) {
    if (loc.includes(blocked)) return false;
  }

  return true;
};

const fetchRemotiveJobs = async (): Promise<number> => {
  let newCount = 0;
  try {
    const response = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=50', { timeout: 5000 });
    const jobs = response.data?.jobs || [];
    for (const job of jobs) {
      if (!isRelevantOpportunity(job.title, job.description || '', job.candidate_required_location || '')) continue;

      const existing = await Opportunity.findOne({
        $or: [{ applicationUrl: job.url }, { source: 'Remotive', title: job.title }]
      });
      if (!existing) {
        const skills = Array.isArray(job.tags) ? job.tags.slice(0, 8) : [];
        const newOpp = new Opportunity({
          title: job.title,
          organization: job.company_name,
          logo: job.company_logo || '',
          type: 'Jobs',
          description: job.description,
          location: job.candidate_required_location || 'Remote',
          workMode: 'Remote',
          paymentType: 'Paid',
          salary: job.salary || 'Not disclosed',
          experienceLevel: 'Not specified',
          skills: skills,
          deadline: null,
          postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
          source: 'Remotive',
          applicationUrl: job.url,
          isVerified: true,
          isNewOpp: true,
          earlyApplicant: false
        });
        await newOpp.save();
        newCount++;
      }
    }
    console.log(`Fetched ${newCount} new Jobs from Remotive.`);
  } catch (error: any) {
    console.error('Error fetching Jobs from Remotive:', error.message);
  }
  return newCount;
};

const fetchArbeitnowInternships = async (): Promise<number> => {
  let newCount = 0;
  try {
    const response = await axios.get('https://www.arbeitnow.com/api/job-board-api', { timeout: 5000 });
    const jobs = response.data?.data || [];
    const internships = jobs.filter((job: any) => {
      const title = job.title.toLowerCase();
      // Match whole words 'intern' or 'internship' to avoid matching 'international' or 'interne'
      return /\b(intern|internship|interns)\b/.test(title);
    });
    
    for (const job of internships) {
      if (!isRelevantOpportunity(job.title, job.description || '', job.location || '')) continue;

      const existing = await Opportunity.findOne({
        $or: [{ applicationUrl: job.url }, { source: 'Arbeitnow', title: job.title }]
      });
      if (!existing) {
        const skills = Array.isArray(job.tags) ? job.tags.slice(0, 8) : [];
        const newOpp = new Opportunity({
          title: job.title,
          organization: job.company_name,
          logo: '', 
          type: 'Internships',
          description: job.description || 'No description provided.',
          location: job.location || 'Remote',
          workMode: job.remote ? 'Remote' : 'On-site',
          paymentType: 'Paid',
          salary: 'Not disclosed',
          experienceLevel: 'Entry Level',
          skills: skills,
          deadline: null,
          postedAt: job.created_at * 1000 ? new Date(job.created_at * 1000) : new Date(),
          source: 'Arbeitnow',
          applicationUrl: job.url,
          isVerified: true,
          isNewOpp: true,
          earlyApplicant: false
        });
        await newOpp.save();
        newCount++;
      }
    }
    console.log(`Fetched ${newCount} new Internships from Arbeitnow.`);
  } catch (error: any) {
    console.error('Error fetching Internships from Arbeitnow:', error.message);
  }
  return newCount;
};

const fetchKontests = async (): Promise<number> => {
  let newCount = 0;
  try {
    const response = await axios.get('https://kontests.net/api/v1/all', { timeout: 5000 });
    const contests = response.data || [];
    
    for (const contest of contests.slice(0, 50)) { // limit to 50
      if (!isRelevantOpportunity(contest.name, `Coding contest hosted on ${contest.site}`, 'Online')) continue;

      const existing = await Opportunity.findOne({
        $or: [{ applicationUrl: contest.url }, { source: 'Kontests', title: contest.name }]
      });
      if (!existing) {
        const newOpp = new Opportunity({
          title: contest.name,
          organization: contest.site || 'Kontests',
          logo: '',
          type: 'Coding Contests',
          description: `Coding contest hosted on ${contest.site}. Duration: ${Math.round(contest.duration / 3600)} hours.`,
          location: 'Online',
          workMode: 'Remote',
          paymentType: 'Unpaid',
          experienceLevel: 'All Levels',
          skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
          deadline: contest.end_time ? new Date(contest.end_time) : null,
          postedAt: new Date(),
          source: 'Kontests',
          applicationUrl: contest.url,
          isVerified: true,
          isNewOpp: true,
          earlyApplicant: false
        });
        await newOpp.save();
        newCount++;
      }
    }
    console.log(`Fetched ${newCount} new Coding Contests from Kontests.`);
  } catch (error: any) {
    console.error('Error fetching Coding Contests from Kontests:', error.message);
  }
  return newCount;
};

const fetchTheMuseInternships = async (): Promise<number> => {
  let newCount = 0;
  try {
    const response = await axios.get('https://www.themuse.com/api/public/jobs?category=Software%20Engineering&category=Data%20Science&category=IT&level=Internship&page=1', { timeout: 5000 });
    const internships = response.data?.results || [];
    
    for (const job of internships) {
      const location = job.locations && job.locations.length > 0 ? job.locations[0].name : 'Remote';
      if (!isRelevantOpportunity(job.name, job.contents || '', location)) continue;

      const existing = await Opportunity.findOne({
        $or: [{ applicationUrl: job.refs?.landing_page }, { source: 'The Muse', title: job.name }]
      });
      if (!existing) {
        const skills = job.categories ? job.categories.map((c: any) => c.name).slice(0, 5) : [];
        const newOpp = new Opportunity({
          title: job.name,
          organization: job.company?.name || 'Unknown',
          logo: '', 
          type: 'Internships',
          description: job.contents || 'No description provided.',
          location: location,
          workMode: location.toLowerCase().includes('remote') ? 'Remote' : 'On-site',
          paymentType: 'Paid',
          salary: 'Not disclosed',
          experienceLevel: 'Internship',
          skills: skills,
          deadline: null,
          postedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
          source: 'The Muse',
          applicationUrl: job.refs?.landing_page || '',
          isVerified: true,
          isNewOpp: true,
          earlyApplicant: false
        });
        await newOpp.save();
        newCount++;
      }
    }
    console.log(`Fetched ${newCount} new Internships from The Muse.`);
  } catch (error: any) {
    console.error('Error fetching Internships from The Muse:', error.message);
  }
  return newCount;
};

export const fetchAndStoreOpportunities = async () => {
  console.log('Scouting for opportunities across all supported categories...');
  
  const results = await Promise.allSettled([
    fetchRemotiveJobs(),
    fetchArbeitnowInternships(),
    fetchKontests(),
    fetchTheMuseInternships()
  ]);
  
  let totalNew = 0;
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      totalNew += result.value;
    }
  });

  // Log explicitly for categories without public APIs (per requirements)
  console.log('[Hackathons] No reliable public API source available. Category is supported in DB/UI but data will be 0 until source is integrated.');
  console.log('[Scholarships] No reliable public API source available. Category is supported in DB/UI but data will be 0 until source is integrated.');
  console.log('[Fellowships] No reliable public API source available. Category is supported in DB/UI but data will be 0 until source is integrated.');
  console.log('[Webinars] No reliable public API source available. Category is supported in DB/UI but data will be 0 until source is integrated.');
  console.log('[Tech Events] No reliable public API source available. Category is supported in DB/UI but data will be 0 until source is integrated.');

  return totalNew;
};
