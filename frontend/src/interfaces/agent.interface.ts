
export interface Agent {
  _id: string;
  userId: string;
  name: string;
  knowledgeBase: string;
  instructions: string;
  tools: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface CreateAgentPayload {
  name: string;
  knowledgeBase: string;
  instructions: string;
  tools: string[];
}

export interface UpdateAgentPayload {
  name?: string;
  knowledgeBase?: string;
  instructions?: string;
  tools?: string[];
  isActive?: boolean;
}

export interface AgentFormData {
  name: string;
  knowledgeBase: string;
  instructions: string;
  tools: string[];
}
