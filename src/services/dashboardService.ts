import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatAPI } from './chatApi';

// Agent interface
export interface Agent {
  _id: string;
  name: string;
  logo?: string;
  unread?: number;
  createdBy?: string;
  editors?: string[];
  bridgeId?: string;
  ownerName?: string;
}

// Switch-org API Response interface (based on actual response)
export interface SwitchOrgResponse {
  status: string;
  message?: string;
  data: {
    _id: string;
    proxyId: string;
    name: string;
    email: string;
    orgAgentMap: { [orgId: string]: string }; // Maps org ID to agent ID
    createdAt: string;
    updatedAt: string;
    avatar: string;
  };
  success: boolean;
}

// Dashboard API Response interface
export interface DashboardApiResponse {
  success: boolean;
  data: {
    agents: Agent[];
  };
  message?: string;
}

// Create Agent Request interface
export interface CreateAgentRequest {
  name: string;
  instructions: string;
  llm: {
    service: string;
    model: string;
  };
}

// Create Agent Response interface
export interface CreateAgentResponse {
  success: boolean;
  data?: Agent;
  message?: string;
}

// Dashboard Service Class
export class DashboardService {
  /**
   * Switch to a specific organization and get orgAgentMap
   * Based on CURL: POST /api/proxy/870623/36jowpr17/user/switch-org
   * Returns orgAgentMap for organization-specific agent mapping
   */
  static async switchOrganization(companyId: string, userId: string, orgId: string): Promise<{ success: boolean; orgAgentMap?: { [orgId: string]: string } }> {
    try {
      const requestData = { orgId: orgId };
      const response = await api.post<SwitchOrgResponse>(`/proxy/${companyId}/${userId}/user/switch-org`, requestData);
      
      if (response.data.success && response.data.data?.orgAgentMap) {
        const orgAgentMap = response.data.data.orgAgentMap;
        return { success: true, orgAgentMap };
      } else {
        return { success: false };
      }
      
    } catch (error: any) {
      console.error('🚨 [Service] Error switching organization:', error.message);
      console.error('🚨 [Service] Switch org error details:', error.response?.data);
      console.error('🚨 [Service] Switch org error status:', error.response?.status);
      return { success: false };
    }
  }

  /**
   * Fetch agents from MSG91 API using axios instance
   * Should be called AFTER switchOrganization
   */
  static async getAgents(companyId: string, userId: string): Promise<Agent[]> {
    try {
      const response = await api.get<DashboardApiResponse>(`/proxy/${companyId}/${userId}/agent/`);
      
      if (response.data.success && response.data.data?.agents) {
        const agents = response.data.data.agents;
        return agents;
      } else {
        return [];
      }
      
    } catch (error: any) {
      console.error('🚨 [Service] Error fetching agents:', error.message);
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }
  }

  /**
   * Combined method: Switch organization and then fetch agents
   * This ensures we switch to the correct org before fetching agents
   * Now uses orgAgentMap to understand organization-agent relationship
   */
  static async switchOrgAndGetAgents(companyId: string, userId: string, orgId: string): Promise<Agent[]> {
    try {
      const switchResponse = await this.switchOrganization(companyId, userId, orgId);
      
      if (!switchResponse.success) {
        return [];
      }
      
      const agents = await this.getAgents(companyId, userId);
      
      return agents;
      
    } catch (error: any) {
      console.error('🚨 [Service] Error in switchOrgAndGetAgents:', error.message);
      throw new Error(`Failed to switch org and get agents: ${error.message}`);
    }
  }

  /**
   * Process agents to separate My Assistant from custom agents
   * My Assistant is either named "AI Assistant" or matches current user's name AND is owned by user
   */
  static async processAgentsForDisplay(agents: Agent[]): Promise<{ myAssistant: Agent | null; customAgents: Agent[] }> {
    const allAgents = [...agents];
    
    // Get current user name from storage
    const userProfile = await AsyncStorage.getItem('userProfile');
    const userData = userProfile ? JSON.parse(userProfile) : null;
    const currentUserName = userData?.name || '';
    
    console.log('🔍 Processing agents, total count:', allAgents.length);
    console.log('📋 Agent names:', allAgents.map(agent => agent.name));
    console.log('👤 Current user name:', currentUserName);
    
    // Look for existing "My Assistant" type agent
    // Look for actual default AI assistant by exact name match or current user's name
    let myAssistant: Agent | null = null;
    const customAgents: Agent[] = [];
    
    // Check if there's already a "My Assistant" type agent that is OWNED by user
    const potentialAssistants = allAgents.filter(agent => 
      agent.name.toLowerCase() === 'ai assistant' ||
      agent.name.toLowerCase() === 'my assistant' ||
      agent.name.toLowerCase() === 'assistant' ||
      (currentUserName && agent.name.toLowerCase() === currentUserName.toLowerCase()) // Dynamic user name match
    );
    
    // From potential assistants, find the one that is owned by user
    let existingAssistant: Agent | null = null;
    for (const agent of potentialAssistants) {
      const isOwned = await ChatAPI.isAgentOwned(agent._id);
      console.log(`🔍 Checking ownership for "${agent.name}" (${agent._id}): ${isOwned ? '✅ OWNED' : '❌ NOT OWNED'}`);
      
      if (isOwned) {
        existingAssistant = agent;
        break; // Use first owned assistant found
      }
    }
    
    if (existingAssistant) {
      // Use the actual AI Assistant that is owned by user
      myAssistant = {
        ...existingAssistant,
        name: 'My Assistant' // Always display as "My Assistant" in dashboard
      };
      console.log('✅ Found OWNED AI Assistant:', existingAssistant.name, 'ID:', existingAssistant._id);
      
      // All other agents are custom agents with their original names
      allAgents.forEach(agent => {
        if (agent._id !== existingAssistant._id) {
          customAgents.push(agent); // Keep original name (youtube, facebook, etc)
        }
      });
    } else {
      // If no owned AI Assistant exists, don't create fake My Assistant
      console.log('❌ No OWNED AI Assistant found in this organization');
      myAssistant = null;
      // All agents remain as custom agents
      customAgents.push(...allAgents);
    }

    // Sort custom agents to show owner's default agent first, then alphabetical
    customAgents.sort((a, b) => {
      // Owner's agent has ownerName or createdBy property (from API)
      const isAOwner = !!(a.ownerName || a.createdBy);
      const isBOwner = !!(b.ownerName || b.createdBy);
      
      // Owner's default agent comes first
      if (isAOwner && !isBOwner) return -1;
      if (!isAOwner && isBOwner) return 1;
      
      // Rest in alphabetical order
      return a.name.localeCompare(b.name);
    });
    
    // Add My Assistant at the very top of custom agents list if it exists
    if (myAssistant) {
      console.log('✅ Moving My Assistant to top of custom agents list:', myAssistant.name);
      customAgents.unshift(myAssistant); // Add at beginning
      console.log('👤 My Assistant: moved to top of custom agents');
      myAssistant = null; // Remove separate My Assistant (now it's in customAgents)
    }
    
    console.log('📊 Final processing result:');
    console.log('🔧 Custom agents (sorted):', customAgents.map(agent => agent.name));
    
    return { myAssistant, customAgents };
  }

  /**
   * Filter agents based on organization ownership
   */
  static filterAgentsByOrganization(agents: Agent[], isOwnOrganization: boolean): Agent[] {
    if (isOwnOrganization) {
      return agents;
    } else {
      return [];
    }
  }

  /**
   * Filter agents by search query
   */
  static filterAgentsBySearch(agents: Agent[], searchQuery: string): Agent[] {
    if (!searchQuery.trim()) {
      return agents;
    }
    
    const filtered = agents.filter(agent =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return filtered;
  }

  /**
   * Check if organization belongs to current user
   * Since we're properly switching organizations now, all orgs should show their agents
   */
  static isUserOwnOrganization(companyName: string): boolean {
    return true;
  }

  /**
   * Create a new agent/assistant
   * Based on CURL: POST /api/proxy/870623/36jowpr17/agent/
   * Payload: {name, instructions, llm: {service: "openai", model: "gpt-5"}}
   */
  static async createAgent(companyId: string, userId: string, agentData: CreateAgentRequest): Promise<CreateAgentResponse> {
    try {
      
      
      const response = await api.post<CreateAgentResponse>(`/proxy/${companyId}/${userId}/agent/`, agentData);
      
      if (response.data.success) {
     
        return response.data;
      } else {
        console.error('❌ [Service] Agent creation failed:', response.data.message);
        return { success: false, message: response.data.message || 'Failed to create agent' };
      }
      
    } catch (error: any) {
      
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create agent';
      return { success: false, message: errorMessage };
    }
  }
}

// Export as default for cleaner imports
export default DashboardService;

// @ts-ignore
