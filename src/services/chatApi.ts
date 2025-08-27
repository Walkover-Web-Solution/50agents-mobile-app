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

export class ChatAPI {
  // Load agent configuration
  static async loadAgentConfig(agentId: string): Promise<AgentDetails | null> {
    try {
      const agentResponse = await api.get(`/proxy/870623/36jowpr17/agent/${agentId}`);
      
      if (agentResponse.data.success && agentResponse.data.data) {
        const details = agentResponse.data.data;
        
        return details;
      }
      return null;
    } catch (error) {
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
      
      const response = await api.get(`/proxy/870623/36jowpr17/chat/message/${threadId}`);
      
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
      
      const chatEndpoint = currentThreadId 
        ? `/proxy/870623/36jowpr17/chat/message?tid=${currentThreadId}`
        : `/proxy/870623/36jowpr17/chat/message`;
      
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
      
    } catch (error) {
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
      const response = await api.get(`/proxy/870623/36jowpr17/thread/${agentId}`);

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
      
    } catch (error) {
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
        } catch (error) {
          console.log('❌ Error loading local thread:', key, error);
        }
      }
      
      threads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return threads;
    } catch (error) {
      console.log('❌ Error loading local threads:', error);
      return [];
    }
  }

  // Delete a thread
  static async deleteThread(threadId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/proxy/870623/36jowpr17/thread/${threadId}`);
      return response.status === 200;
    } catch (error) {
      console.log('❌ Delete Thread Error:', error);
      return false;
    }
  }
}
