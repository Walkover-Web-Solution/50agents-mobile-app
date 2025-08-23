import api from '../api/axios';

// Agent interface
export interface Agent {
  _id: string;
  name: string;
  logo?: string;
  unread?: number;
  createdBy?: string;
  editors?: string[];
  bridgeId?: string;
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
   * Process agents into "My Assistant" and custom agents
   */
  static processAgents(allAgents: Agent[]): { myAssistant: Agent | null; customAgents: Agent[] } {
    if (!allAgents || allAgents.length === 0) {
      return { myAssistant: null, customAgents: [] };
    }
    
    const firstAgent = allAgents[0];
    const myAssistant: Agent | null = firstAgent ? {
      ...firstAgent,
      name: 'My Assistant' // Override name for display
    } : null;
    
    const customAgents = allAgents.slice(1);
    
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
}

// Export as default for cleaner imports
export default DashboardService;
