import { StateGraph, MemorySaver, START, END } from '@langchain/langgraph';

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

// Nodes
const discoverOpportunities = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Discovering opportunities from sources...');
  // In a real scenario, this would call adapters (LinkedIn, Indeed, RSS)
  // For now, we mock the discovery
  return {
    rawOpportunities: [
      { title: 'Frontend Developer Intern', org: 'TechCorp', rawSkills: 'React, TS' }
    ]
  };
};

const extractAndValidateData = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Extracting and validating data...');
  const validated = state.rawOpportunities.map(opp => ({
    ...opp,
    title: opp.title,
    organization: opp.org,
    skills: opp.rawSkills.split(', '),
    isValid: true
  }));
  return { validatedOpportunities: validated };
};

const matchUserProfile = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Matching opportunities with user profiles...');
  const matched = state.validatedOpportunities.map(opp => ({
    ...opp,
    matchScore: Math.floor(Math.random() * 20) + 80 // Mock AI match score
  }));
  return { matchedOpportunities: matched };
};

const storeOpportunities = async (state: AgentState): Promise<Partial<AgentState>> => {
  console.log('[Agent] Storing opportunities to MongoDB...');
  // Logic to save to MongoDB would go here
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
  console.log('--- Starting Agent Run ---');
  const result = await agentApp.invoke(initializeState(), { configurable: { thread_id: Date.now().toString() } });
  console.log('--- Agent Run Complete ---', result);
  return result;
};
