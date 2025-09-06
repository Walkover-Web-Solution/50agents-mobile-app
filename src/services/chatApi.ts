import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { API_CONFIG } from '../config/api';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AgentDetails {
  _id: string;
  name: string;
  bridgeId: string;
  logo?: string;
  orgId: string;
  llm: {
    service: string;
    model: string;
  };
  instructions: string;
  ownerName: string;
}

export interface ChatThread {
  tid: string;
  threadName?: string;  // Thread name from server
  messages: Message[];
  agentId: string;
  createdAt: Date;
  updatedAt?: Date;     // Last updated timestamp
  serverId?: string;    // Server's _id for reference
}

// Model option for model-switch dropdown
export interface ModelOption {
  id: string;
  name: string;
  service: string;
}

export class ChatAPI {
  // Build dynamic proxy prefix from storage (falls back to defaults)
  private static async getProxyPrefix(): Promise<string> {
    try {
      const companyId = await AsyncStorage.getItem('currentCompanyId');
      const userId = await AsyncStorage.getItem('currentUserId');
      const c = companyId || '870623';
      const u = userId || '36jowpr17';
      return `/proxy/${c}/${u}`;
    } catch {
      return `/proxy/870623/36jowpr17`;
    }
  }

  // Load agent configuration
  static async loadAgentConfig(agentId: string): Promise<AgentDetails | null> {
    try {
      const prefix = await this.getProxyPrefix();
      const agentResponse = await api.get(`${prefix}/agent/${agentId}`);
      
      if (agentResponse.data.success && agentResponse.data.data) {
        const details = agentResponse.data.data;
        
        return details;
      }
      return null;
    } catch (error: any) {
      console.log('❌ Agent Config Load Error:', error);
      return null;
    }
  }

  // Load thread messages from server API
  static async loadThreadHistory(threadId: string, agentId: string, agentDetails: AgentDetails): Promise<Message[]> {
    try {
      // Use same token method as sendMessage
      const { getProxyAuthToken } = require('../utils/auth');
      const token = await getProxyAuthToken();
      
      if (!token) {
        console.log('❌ No proxy auth token found in storage');
        return [];
      }
      
      const prefix = await this.getProxyPrefix();
      const response = await api.get(`${prefix}/chat/message/${threadId}`);
      
      if (response.data.success && response.data.data?.messages) {
        const serverMessages = response.data.data.messages;
        
        // Convert server messages to app format
        const loadedMessages: Message[] = serverMessages.map((msg: any, index: number) => ({
          id: msg.id?.toString() || `msg_${index}`,
          text: msg.content || '',
          isUser: msg.role === 'user',
          timestamp: new Date(msg.createdAt)
        }));
        
        return loadedMessages;
      } else {
        console.log('❌ Invalid thread history response structure');
        console.log('Response data:', response.data);
        return [];
      }
      
    } catch (error: any) {
      console.log('❌ DETAILED THREAD HISTORY ERROR:');
      console.log('Error message:', error.message);
      console.log('Error response status:', error.response?.status);
      console.log('Error response data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Full error object:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 UNAUTHORIZED: Token expired for thread loading');
      } else if (error.response?.status === 404) {
        console.log('🔍 NOT FOUND: Thread not found');
      }
      
      return [];
    }
  }

  // Send message to chat API
  static async sendMessage(messageText: string, agentId: string, currentThreadId: string | null): Promise<{success: boolean, message: string, threadId?: string}> {
    try {
      // Check if we have a proxy auth token
      const { getProxyAuthToken } = require('../utils/auth');
      const token = await getProxyAuthToken();
      
      const prefix = await this.getProxyPrefix();
      const chatEndpoint = currentThreadId 
        ? `${prefix}/chat/message?tid=${currentThreadId}`
        : `${prefix}/chat/message`;
      
      const chatPayload = {
        message: messageText,
        agent: agentId,
      };
      
      const response = await api.post(chatEndpoint, chatPayload);
      
      if (response.data.status === 'success' && response.data.data) {
        const responseData = response.data.data;
        
        if (!currentThreadId && responseData.tid) {
          console.log('🆕 NEW THREAD CREATED:', responseData.tid);
        }
        
        return {
          success: true,
          message: responseData.message || 'Response received from agent',
          threadId: responseData.tid
        };
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error: any) {
      if (error.response?.status === 429) {
        return {
          success: false,
          message: 'Too many requests. Please wait a moment and try again.'
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Authentication error. Please login again.'
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Session expired. Please login again.'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Agent not found. Please try again.'
        };
      }
      
      return {
        success: false,
        message: 'Sorry, I encountered an error. Please try again.'
      };
    }
  }

  // Save thread data to AsyncStorage
  static async saveThreadData(threadId: string, messages: Message[], agentId?: string): Promise<void> {
    try {
      // Save individual thread messages
      const storageKey = `thread_messages_${threadId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(messages));
      
      // If agentId provided, update agent's thread list metadata
      if (agentId) {
        const agentThreadKey = `agent_thread_${agentId}`;
        await AsyncStorage.setItem(agentThreadKey, JSON.stringify({
          threadId,
          agentId,
          lastUpdated: new Date().toISOString(),
          messageCount: messages.length
        }));
      }
      
    } catch (error: any) {
      console.log('❌ Error saving thread data:', error);
    }
  }

  // Load all threads for an agent from server API
  static async loadAllThreads(agentId: string): Promise<ChatThread[]> {
    try {
      // Use same token method as sendMessage
      const { getProxyAuthToken } = require('../utils/auth');
      const token = await getProxyAuthToken();
      
      if (!token) {
        return [];
      }
      
      // Use axios API for consistency with sendMessage
      const prefix = await this.getProxyPrefix();
      const response = await api.get(`${prefix}/thread/${agentId}`);

      // Check if response is successful
      if (response.data.status === 'success' && response.data.data?.threads) {
        const serverThreads = response.data.data.threads;
        
        // Convert server threads to ChatThread format
        const chatThreads: ChatThread[] = serverThreads.map((serverThread: any) => ({
          tid: serverThread.middleware_id, // Use middleware_id as thread ID
          threadName: serverThread.name,   // Thread name from server
          agentId: agentId,
          createdAt: new Date(serverThread.createdAt),
          updatedAt: new Date(serverThread.updatedAt),
          messages: [], // Will be loaded when thread is selected
          serverId: serverThread._id  // Store server's _id for reference
        }));
        
        // Sort by creation date (newest first)
        chatThreads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return chatThreads;
      } else {
        return [];
      }
      
    } catch (error: any) {
      // Fallback to local threads if API fails
      return await this.loadLocalThreads(agentId);
    }
  }

  // Fallback: Load local threads (previous implementation)
  private static async loadLocalThreads(agentId: string): Promise<ChatThread[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const threadKeys = allKeys.filter(key => key.startsWith(`thread_messages_`));
      
      const threads: ChatThread[] = [];
      
      for (const key of threadKeys) {
        try {
          const messagesData = await AsyncStorage.getItem(key);
          if (messagesData) {
            const messages = JSON.parse(messagesData);
            const threadId = key.replace('thread_messages_', '');
            
            const threadKey = `agent_thread_${agentId}`;
            const threadData = await AsyncStorage.getItem(threadKey);
            
            if (threadData) {
              const parsedThreadData = JSON.parse(threadData);
              if (parsedThreadData.threadId === threadId) {
                const messagesWithDates = messages.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                }));
                
                threads.push({
                  tid: threadId,
                  messages: messagesWithDates,
                  agentId,
                  createdAt: new Date(parsedThreadData.lastUpdated)
                });
              }
            }
          }
        } catch (error: any) {
          console.log('❌ Error loading local thread:', key, error);
        }
      }
      
      threads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return threads;
    } catch (error: any) {
      console.log('❌ Error loading local threads:', error);
      return [];
    }
  }

  // Delete a thread
  static async deleteThread(threadId: string): Promise<boolean> {
    try {
      const prefix = await this.getProxyPrefix();
      const response = await api.delete(`${prefix}/thread/${threadId}`);
      return response.status === 200;
    } catch (error: any) {
      console.log('❌ Delete Thread Error:', error);
      return false;
    }
  }

  // ===== Model switching helpers/APIs =====
  // Cache of owned agent IDs per-organization to reduce repeated validation calls
  private static ownedAgentsCacheByOrg: Record<string, Set<string>> = {};

  private static async getCurrentOrgId(): Promise<string> {
    try {
      // currentOrgId is set by OrganizationService.switchOrganization
      const orgId = await AsyncStorage.getItem('currentOrgId');
      return orgId || 'default';
    } catch {
      return 'default';
    }
  }

  private static async getUserOwnedAgents(): Promise<Set<string>> {
    try {
      const orgId = await this.getCurrentOrgId();
      if (this.ownedAgentsCacheByOrg[orgId]) {
        return this.ownedAgentsCacheByOrg[orgId];
      }

      // Get current user once for id comparisons
      let currentUserId: string | null = null;
      try {
        const user = await this.getCurrentUser();
        currentUserId = String(user?._id || '').trim();
      } catch (_) {
        currentUserId = null;
      }

      const prefix = await this.getProxyPrefix();
      const response = await api.get(`${prefix}/agent/`);
      const agents = response.data?.data?.agents || response.data?.data || [];

      const ids = new Set<string>();
      if (Array.isArray(agents)) {
        agents.forEach((agent: any) => {
          const id = agent?._id || agent?.id || agent?.agentId;
          const createdBy = String(agent?.createdBy || '').trim();
          const editors: string[] = Array.isArray(agent?.editors)
            ? agent.editors.map((e: any) => String(e).trim())
            : [];

          // OWNERSHIP RULE: agent.createdBy === current user _id OR user is in editors
          if (
            id &&
            currentUserId &&
            (createdBy === currentUserId || editors.includes(currentUserId))
          ) {
            ids.add(String(id));
          }
        });
      }

      // Augment with /user -> orgAgentMap (user's personal agent per org)
      try {
        const user = await this.getCurrentUser();
        const map = user?.orgAgentMap || {};
        Object.values(map || {}).forEach((aid: any) => {
          if (aid) ids.add(String(aid));
        });
      } catch (e) {
        // swallow, main source remains filtered /agent/ list
      }

      this.ownedAgentsCacheByOrg[orgId] = ids;
      return ids;
    } catch (error: any) {
      console.warn('⚠️ getUserOwnedAgents warning:', error?.response?.status, error?.message);
      // Prefer strict safe default: no ownership on error
      return new Set<string>();
    }
  }

  private static normalizeName(name: string | undefined | null): string {
    return (name || '').trim().toLowerCase();
  }

  private static async confirmOwnershipByAgentDetails(agentId: string): Promise<boolean | null> {
    try {
      const details = await this.loadAgentConfig(agentId);
      if (!details) return null;
      const ownerName = this.normalizeName(details.ownerName);
      const userProfileRaw = await AsyncStorage.getItem('userProfile');
      const userProfile = userProfileRaw ? JSON.parse(userProfileRaw) : null;
      const currentUserName = this.normalizeName(userProfile?.name);
      if (!ownerName || !currentUserName) return null;
      return ownerName === currentUserName;
    } catch (error: any) {
      return null;
    }
  }

  static async isAgentOwned(agentId: string): Promise<boolean> {
    const owned = await this.getUserOwnedAgents();
    return owned.has(String(agentId));
  }

  static async updateAgentModel(
    agentId: string,
    model: string,
    service: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Strict pre-validation: only allow if agent is owned
      const isOwned = await this.isAgentOwned(agentId);
      if (!isOwned) {
        return {
          success: false,
          message: "You can only modify agents that you own. Try creating a new assistant or use 'My Assistant'.",
        };
      }

      const payload = { llm: { service, model } };
      const prefix = await this.getProxyPrefix();
      console.log(' [ModelSwitch] PATCH updateAgentModel ->', { agentId, service, model, url: `${prefix}/agent/${agentId}?` });
      const resp = await api.patch(`${prefix}/agent/${agentId}?`, payload);

      if (resp.status === 200 && (resp.data?.success || resp.data?.status === 'success')) {
        return { success: true };
      }

      const errMessage = resp.data?.message || 'Unable to update model.';
      return { success: false, message: errMessage };
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.message || 'Request failed';
      if (status === 403) {
        return { success: false, message: 'You are not authorized to update this agent.' };
      }
      return { success: false, message: msg };
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('proxy_auth_token');
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch('https://routes.msg91.com/api/proxy/870623/36jowpr17/user', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          'origin': 'https://chat.50agents.com',
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'proxy_auth_token': token,
          'referer': 'https://chat.50agents.com/',
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        }
      });

      const data = await response.json();
      console.log('🔍 [ChatAPI] getCurrentUser response:', data);

      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error('Failed to get user data');
      }
    } catch (error) {
      console.error('🚨 [ChatAPI] getCurrentUser error:', error);
      throw error;
    }
  }

  /**
   * Check if agent is owned by current user
   * Returns true if agent should show model switch (i.e., owned by user)
   */
  static async isAgentOwnedByUser(agentId: string): Promise<boolean> {
    try {
      // Delegate to isAgentOwned which uses /agent/ and /user fallbacks
      return await this.isAgentOwned(agentId);
    } catch (error) {
      console.error('� [ChatAPI] Error checking agent ownership:', error);
      return false;
    }
  }

  static invalidateOwnershipCache(orgId?: string) {
    if (orgId) {
      delete this.ownedAgentsCacheByOrg[orgId];
    } else {
      this.ownedAgentsCacheByOrg = {};
    }
  }

  static async getAvailableModels(): Promise<ModelOption[]> {
    try {
      const prefix = await this.getProxyPrefix();
      const response = await api.get(`${prefix}/utility/services-models`);
      const options: ModelOption[] = [];

      if (response.data?.status === 'success' && response.data?.data) {
        const { services, models } = response.data.data as { services: string[]; models: Record<string, string[]> };
        const knownServices = Array.isArray(services) ? services : Object.keys(models || {});

        knownServices.forEach((service: string) => {
          const list: string[] = (models && models[service]) || [];
          list.forEach((modelName: any) => {
            const name = String(modelName || '').trim();
            if (!name) return;
            // Filter out stray service names in model list
            if (knownServices.includes(name)) return;
            options.push({ id: name, name, service });
          });
        });
      }

      return options;
    } catch (error: any) {
      console.warn('⚠️ getAvailableModels error:', error?.response?.status, error?.message);
      return [];
    }
  }
}
