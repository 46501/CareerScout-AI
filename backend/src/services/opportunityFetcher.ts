import axios from 'axios';
import Opportunity from '../models/Opportunity';

export const fetchAndStoreOpportunities = async () => {
  let newCount = 0;
  
  try {
    console.log('Fetching opportunities from Remotive API...');
    
    // Fetch Software Development jobs from Remotive
    const response = await axios.get('https://remotive.com/api/remote-jobs?category=software-dev&limit=50', {
      timeout: 15000 
    });
    
    const jobs = response.data?.jobs || [];
    
    for (const job of jobs) {
      // Check if it already exists
      const existing = await Opportunity.findOne({
        $or: [
          { applicationUrl: job.url },
          { source: 'Remotive', title: job.title, organization: job.company_name }
        ]
      });

      if (!existing) {
        // Map Remotive tags to our skills array
        const skills = Array.isArray(job.tags) ? job.tags.slice(0, 8) : [];
        
        const newOpp = new Opportunity({
          title: job.title,
          organization: job.company_name,
          logo: job.company_logo || '',
          type: 'Jobs', // Remotive is primarily full-time jobs
          description: job.description,
          location: job.candidate_required_location || 'Remote',
          workMode: 'Remote',
          salary: job.salary || 'Not disclosed',
          experienceLevel: 'Not specified', // Remotive doesn't explicitly provide this easily
          skills: skills,
          deadline: null, // No explicit deadline
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
    
    console.log(`Successfully fetched and stored ${newCount} new opportunities from Remotive.`);
  } catch (error: any) {
    console.error('Error fetching from Remotive:', error.message);
  }
  
  return newCount;
};
