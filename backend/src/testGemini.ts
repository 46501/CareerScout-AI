import { extractResumeData, extractOpportunityData, matchOpportunity } from './services/geminiService';
import { runAgent } from './agent/agent';

const test = async () => {
  console.log('--- Testing Gemini Service ---');
  
  // Test 1: Resume Extraction
  const sampleResume = `
    Om Kulkarni
    Software Engineer Intern
    Experience: 
    - Developed full stack applications using React, Node.js, and MongoDB.
    Education: B.Tech in Computer Science
  `;
  console.log('\nTesting extractResumeData:');
  const resumeResult = await extractResumeData(sampleResume);
  console.log(JSON.stringify(resumeResult, null, 2));
  
  // Test 2: Opportunity Matching
  const sampleOpp = {
    title: 'Full Stack Developer Intern',
    organization: 'Tech Innovations Inc.',
    skills: ['React', 'Node.js', 'MongoDB', 'AWS']
  };
  console.log('\nTesting matchOpportunity:');
  const matchResult = await matchOpportunity(resumeResult, sampleOpp);
  console.log(JSON.stringify(matchResult, null, 2));

  // Test 3: Run the Agent
  console.log('\nTesting Agent Execution:');
  const agentResult = await runAgent([] as any);
  console.log('\nAgent matched opportunities:');
  console.log(JSON.stringify(agentResult.matchedOpportunities, null, 2));
};

test().catch(console.error);
