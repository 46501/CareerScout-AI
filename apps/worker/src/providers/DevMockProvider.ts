import mongoose from 'mongoose';
import { Opportunity } from '../../../api/src/models/Opportunity';

export class DevMockProvider {
  name = 'DevMockProvider';
  
  async run() {
    console.log(`[${this.name}] Starting mock opportunity generation...`);
    
    const mockOpportunities = [
      {
        title: 'Software Engineering Intern',
        organization: 'TechFlow',
        organizationLogo: 'https://logo.clearbit.com/google.com',
        description: 'Join our core engineering team to build scalable microservices for our cloud platform. You will work closely with senior engineers using Node.js, TypeScript, and MongoDB.',
        type: 'INTERNSHIP',
        skills: ['JavaScript', 'TypeScript', 'Node.js', 'MongoDB', 'Docker'],
        location: 'San Francisco, CA',
        remoteType: 'HYBRID',
        salary: '$40 - $55 / hr',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        postedAt: new Date(),
        source: 'DevMock',
        sourceId: 'mock-1',
        sourceUrl: 'https://example.com/jobs/1',
        applicationUrl: 'https://example.com/apply/1',
        isActive: true,
        lastVerifiedAt: new Date(),
      },
      {
        title: 'Full Stack Developer',
        organization: 'NextGen Startup',
        organizationLogo: 'https://logo.clearbit.com/stripe.com',
        description: 'We are looking for a product-minded Full Stack Developer to lead our new frontend architecture. You must be deeply familiar with React, Next.js, and modern CSS (Tailwind).',
        type: 'JOB',
        skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'PostgreSQL'],
        remoteType: 'REMOTE',
        salary: '$110,000 - $140,000',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        source: 'DevMock',
        sourceId: 'mock-2',
        sourceUrl: 'https://example.com/jobs/2',
        applicationUrl: 'https://example.com/apply/2',
        isActive: true,
        lastVerifiedAt: new Date(),
      },
      {
        title: 'Global AI Hackathon 2026',
        organization: 'AI Innovators',
        organizationLogo: 'https://logo.clearbit.com/openai.com',
        description: 'Build the next generation of AI agents. Compete with teams globally for a $50k prize pool. Open to all students and professionals.',
        type: 'HACKATHON',
        skills: ['Python', 'Machine Learning', 'OpenAI API', 'React'],
        remoteType: 'REMOTE',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        postedAt: new Date(),
        source: 'DevMock',
        sourceId: 'mock-3',
        sourceUrl: 'https://example.com/hackathon/1',
        applicationUrl: 'https://example.com/hackathon/register/1',
        isActive: true,
        lastVerifiedAt: new Date(),
      }
    ];

    let count = 0;
    for (const opp of mockOpportunities) {
      try {
        await Opportunity.findOneAndUpdate(
          { sourceId: opp.sourceId, source: opp.source },
          opp,
          { upsert: true, new: true }
        );
        count++;
      } catch (err) {
        console.error(`[${this.name}] Failed to save opportunity`, err);
      }
    }

    console.log(`[${this.name}] Successfully processed ${count} mock opportunities.`);
    return count;
  }
}
