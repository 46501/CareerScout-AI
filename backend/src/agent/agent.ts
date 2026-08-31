import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';
import { extractOpportunityData, matchOpportunity } from '../services/geminiService';
import Opportunity from '../models/Opportunity';

// Define the state for the agent
interface AgentState {
  rawOpportunities: any[];
  validatedOpportunities: any[];
  matchedOpportunities: any[];
  errors: string[];
}

const initializeState = (): AgentState => ({
  rawOpportunities: [],
  validatedOpportunities: [],
  matchedOpportunities: [],
  errors: [],
});

// Mock user profile for agent runs
const MOCK_USER_PROFILE = {
  skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
  experienceLevel: 'Entry Level',
  preferredRoles: ['Frontend Developer', 'Full Stack Developer']
};

// Nodes
const discoverOpportunities = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Discovering opportunities from sources...');
  // Mocking discovery source payload
  return {
    rawOpportunities: [
      { title: 'Frontend Developer Intern', org: 'TechCorp', rawSkills: 'React, TS' },
      { title: 'Data Scientist', org: 'AI Innovations', rawSkills: 'Python, Machine Learning, SQL' }
    ]
  };
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
          title: extracted.title,
          organization: extracted.organization,
          skills: extracted.skills,
          type: extracted.type
        });
      }
    } catch (err) {
      console.error('Extraction failed for opportunity:', err);
    }
  }
  
  return { validatedOpportunities: validated };
};

const matchUserProfile = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Matching opportunities with user profiles using Gemini...');
  const matched = [];
  
  for (const opp of state.validatedOpportunities) {
    try {
      const matchResult = await matchOpportunity(MOCK_USER_PROFILE, opp);
      matched.push({
        ...opp,
        matchScore: matchResult.matchScore,
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
            location: 'Remote', // Default fallback
            workMode: 'Remote',
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

export const runAgent = async () => {
  console.log('--- Starting Gemini-Powered Agent Run ---');
  // @ts-ignore
  const result = await agentApp.invoke(initializeState(), { configurable: { thread_id: Date.now().toString() } });
  console.log('--- Agent Run Complete ---');
  return result;
};
