import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';
import { extractOpportunityData, matchOpportunity } from '../services/geminiService';
import Opportunity from '../models/Opportunity';
import User from '../models/User';

// Define the state for the agent
interface AgentState {
  userId: string;
  userProfile: any;
  rawOpportunities: any[];
  validatedOpportunities: any[];
  matchedOpportunities: any[];
  errors: string[];
}

const initializeState = (userId: string, userProfile: any): AgentState => ({
  userId,
  userProfile,
  rawOpportunities: [],
  validatedOpportunities: [],
  matchedOpportunities: [],
  errors: [],
});

// Seed data to simulate a robust discovery from job boards
const SEED_OPPORTUNITIES = [
  { title: 'Frontend Developer Intern', org: 'TechCorp', rawSkills: 'React, TypeScript, CSS', type: 'Internships', location: 'Remote', description: 'Build beautiful UIs using React and Tailwind CSS.' },
  { title: 'Data Scientist', org: 'AI Innovations', rawSkills: 'Python, Machine Learning, SQL', type: 'Jobs', location: 'New York, NY', description: 'Develop predictive models and analyze large datasets.' },
  { title: 'Full Stack Engineer', org: 'CloudScale', rawSkills: 'Node.js, React, MongoDB, Express', type: 'Jobs', location: 'San Francisco, CA', description: 'End to end web development on a modern MERN stack.' },
  { title: 'UX Designer', org: 'CreativeMinds', rawSkills: 'Figma, Prototyping, Wireframing', type: 'Jobs', location: 'Remote', description: 'Design user-centric interfaces and conduct usability testing.' },
  { title: 'DevOps Engineer', org: 'InfraTech', rawSkills: 'Docker, Kubernetes, AWS, CI/CD', type: 'Jobs', location: 'Seattle, WA', description: 'Manage and scale cloud infrastructure.' },
  { title: 'Cybersecurity Analyst', org: 'SecureNet', rawSkills: 'Network Security, Ethical Hacking, SIEM', type: 'Jobs', location: 'Austin, TX', description: 'Monitor and protect enterprise networks from threats.' },
  { title: 'Mobile App Developer', org: 'AppWorks', rawSkills: 'React Native, iOS, Android', type: 'Jobs', location: 'Remote', description: 'Develop cross-platform mobile applications.' },
  { title: 'Blockchain Developer', org: 'CryptoLabs', rawSkills: 'Solidity, Ethereum, Web3.js', type: 'Jobs', location: 'Remote', description: 'Build decentralized applications and smart contracts.' },
  { title: 'Global Tech Hackathon', org: 'DevCommunity', rawSkills: 'Any, Teamwork, Innovation', type: 'Hackathons', location: 'Online', description: '48-hour coding marathon to solve real-world problems.' },
  { title: 'Women in Tech Scholarship', org: 'TechFoundation', rawSkills: 'Computer Science, STEM', type: 'Scholarships', location: 'Global', description: 'Financial support for women pursuing degrees in technology.' },
  { title: 'AI Engineering Webinar', org: 'DeepLearning.AI', rawSkills: 'AI, NLP, LLMs', type: 'Webinars', location: 'Online', description: 'Learn about the latest advancements in Large Language Models.' },
  { title: 'Backend Developer', org: 'ServerPro', rawSkills: 'Java, Spring Boot, PostgreSQL', type: 'Jobs', location: 'Chicago, IL', description: 'Design and implement scalable microservices.' },
  { title: 'Game Developer', org: 'PlayStudios', rawSkills: 'Unity, C#, 3D Modeling', type: 'Jobs', location: 'Los Angeles, CA', description: 'Create immersive gaming experiences.' },
  { title: 'Cloud Architect', org: 'CloudScale', rawSkills: 'Azure, System Design, Terraform', type: 'Jobs', location: 'Remote', description: 'Design enterprise cloud architectures.' },
  { title: 'React Native Intern', org: 'StartupInc', rawSkills: 'React Native, JavaScript', type: 'Internships', location: 'Remote', description: 'Help build our MVP mobile app.' }
];

// Nodes
const discoverOpportunities = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log(`[Agent] Discovering opportunities for user ${state.userId}...`);
  // In a real app, you would ping LinkedIn/Greenhouse APIs. Here we use a robust seed.
  // We randomly select a subset to simulate dynamic discovery.
  const shuffled = SEED_OPPORTUNITIES.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 10);
  
  return { rawOpportunities: selected };
};

const extractAndValidateData = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Extracting and validating data using Gemini...');
  const validated = [];
  
  for (const raw of state.rawOpportunities) {
    try {
      const extracted = await extractOpportunityData(raw);
      if (extracted.isValid) {
        validated.push({
          ...raw,
          title: extracted.title || raw.title,
          organization: extracted.organization || raw.org,
          skills: extracted.skills && extracted.skills.length > 0 ? extracted.skills : raw.rawSkills.split(',').map((s: string) => s.trim()),
          type: extracted.type || raw.type
        });
      }
    } catch (err) {
      console.error('Extraction failed for opportunity:', err);
    }
  }
  
  return { validatedOpportunities: validated };
};

const matchUserProfile = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Matching opportunities with REAL user profile using Gemini...');
  const matched = [];
  
  for (const opp of state.validatedOpportunities) {
    try {
      const matchResult = await matchOpportunity(state.userProfile, opp);
      matched.push({
        ...opp,
        matchScore: matchResult.matchScore || 50,
        matchExplanation: matchResult
      });
    } catch (err) {
      console.error('Matching failed for opportunity:', err);
      matched.push({ ...opp, matchScore: 50 }); // Deterministic fallback
    }
  }
  
  return { matchedOpportunities: matched };
};

const storeOpportunities = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Storing matched opportunities to MongoDB...');
  
  for (const opp of state.matchedOpportunities) {
    try {
      await Opportunity.findOneAndUpdate(
        { title: opp.title, organization: opp.organization }, // Prevent exact duplicates
        { 
          $set: {
            title: opp.title,
            organization: opp.organization,
            skills: opp.skills,
            type: opp.type || 'Jobs',
            matchScore: opp.matchScore,
            description: opp.description || 'Discovered by CareerScout AI Agent.',
            location: opp.location || 'Remote',
            workMode: opp.location === 'Remote' ? 'Remote' : 'On-site',
            isNewOpp: true,
            source: 'CareerScout AI Agent',
            applicationUrl: 'https://careerscout-ai-apply.example.com/' + encodeURIComponent(opp.title)
          }
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Failed to store opportunity:', err);
    }
  }
  
  console.log(`Stored ${state.matchedOpportunities.length} opportunities.`);
  return {};
};

// Build Graph
const workflow = new StateGraph<AgentState>({
  channels: {
    userId: { value: (x, y) => y, default: () => '' },
    userProfile: { value: (x, y) => y, default: () => ({}) },
    rawOpportunities: { value: (x, y) => y, default: () => [] },
    validatedOpportunities: { value: (x, y) => y, default: () => [] },
    matchedOpportunities: { value: (x, y) => y, default: () => [] },
    errors: { value: (x, y) => y, default: () => [] }
  }
})
  .addNode('discover', discoverOpportunities)
  .addNode('validate', extractAndValidateData)
  .addNode('match', matchUserProfile)
  .addNode('store', storeOpportunities)
  .addEdge(START, 'discover')
  .addEdge('discover', 'validate')
  .addEdge('validate', 'match')
  .addEdge('match', 'store')
  .addEdge('store', END);

export const agentApp = workflow.compile({ checkpointer: new MemorySaver() });

export const runAgent = async (userId: string) => {
  console.log(`--- Starting Gemini-Powered Agent Run for User: ${userId} ---`);
  
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for agent run.');
  }

  // @ts-ignore
  const result = await agentApp.invoke(initializeState(userId, user.profile || {}), { configurable: { thread_id: Date.now().toString() } });
  console.log('--- Agent Run Complete ---');
  return result;
};
