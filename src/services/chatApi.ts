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
      console.log('🚀 PHASE 1: Loading Agent Config...');
      console.log('📋 Agent ID:', agentId);
      
      const agentResponse = await api.get(`/proxy/870623/36jowpr17/agent/${agentId}`);
      
      if (agentResponse.data.success && agentResponse.data.data) {
        const details = agentResponse.data.data;
        
        console.log('✅ Agent Config Loaded:');
        console.log('🤖 Name:', details.name);
        console.log('🧠 LLM:', details.llm);
        console.log('📝 Instructions:', details.instructions);
        console.log('🌉 Bridge ID:', details.bridgeId);
        console.log('🏢 Org ID:', details.orgId);
        
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
      console.log('🔄 Loading Thread Messages for:', threadId);
      console.log('🔍 ThreadId type:', typeof threadId, 'Length:', threadId?.length);
      
      const token = await AsyncStorage.getItem('proxy_auth_token');
      if (!token) {
        console.log('❌ No proxy auth token found');
        return [];
      }
      
      // Use the cleaner messages API endpoint
      const messagesEndpoint = `https://routes.msg91.com/api/proxy/870623/36jowpr17/chat/message/${threadId}`;
      console.log('🌐 Messages API Endpoint:', messagesEndpoint);
      console.log('🔑 Using token:', token.substring(0, 20) + '...');
    
      const response = await fetch(messagesEndpoint, {
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
      
      console.log('✅ Messages Response Status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('📨 Messages Response:', JSON.stringify(responseData, null, 2));
        
        if (responseData.success && responseData.data?.messages) {
          const serverMessages = responseData.data.messages;
          
          // Convert server messages to app format
          const loadedMessages: Message[] = serverMessages.map((msg: any, index: number) => ({
            id: msg.id?.toString() || `msg_${index}`,
            text: msg.content || '',
            isUser: msg.role === 'user',
            timestamp: new Date(msg.createdAt)
          }));
          
          console.log('✅ Loaded messages count:', loadedMessages.length);
          return loadedMessages;
        } else {
          console.log('⚠️ No messages in response or API error');
          return [];
        }
      } else {
        console.log('❌ Messages API failed with status:', response.status);
        return [];
      }
      
    } catch (error: any) {
      console.log('❌ Error loading thread messages:', error);
      return [];
    }
  }

  // Send message to chat API
  static async sendMessage(messageText: string, agentId: string, currentThreadId: string | null): Promise<{success: boolean, message: string, threadId?: string}> {
    try {
      console.log('🚀 PHASE 2/4: Sending Message...');
      console.log('📝 User Message:', messageText);
      console.log('🧵 Current Thread ID:', currentThreadId);
      
      const chatEndpoint = currentThreadId 
        ? `/proxy/870623/36jowpr17/chat/message?tid=${currentThreadId}`
        : `/proxy/870623/36jowpr17/chat/message`;
      
      const chatPayload = {
        message: messageText,
        agent: agentId,
      };
      
      console.log('🌐 API Endpoint:', chatEndpoint);
      console.log('📦 Payload:', chatPayload);
      
      const response = await api.post(chatEndpoint, chatPayload);
      
      console.log('✅ API Response Status:', response.status);
      console.log('📨 Full Response:', response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        const responseData = response.data.data;
        
        if (!currentThreadId && responseData.tid) {
          console.log('🆕 NEW THREAD CREATED:', responseData.tid);
        }
        
        if (responseData.message.includes('successfully sent') || 
            responseData.message.includes('email has been') ||
            responseData.message.includes('completed')) {
          console.log('🔧 ACTION EXECUTED: Tool/Integration used');
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
      console.log('❌ CHAT ERROR:', error);
      console.log('❌ Error Response:', error.response?.data);
      
      if (error.response?.status === 429) {
        console.log('⏳ RATE LIMITED: Too many requests');
      } else if (error.response?.status === 400) {
        console.log('🔑 AUTH ERROR: Token/config issue');
      }
      
      return {
        success: false,
        message: 'Sorry, I encountered an error. Please try again.'
      };
    }
  }

  // Save thread data to AsyncStorage
  static async saveThreadData(threadId: string, messages: Message[], agentId: string): Promise<void> {
    try {
      const threadData: ChatThread = {
        tid: threadId,
        messages,
        agentId,
        createdAt: new Date(),
      };
      await AsyncStorage.setItem(`thread-${threadId}`, JSON.stringify(threadData));
      console.log('✅ Thread data saved:', threadId);
    } catch (error) {
      console.log('❌ Error saving thread data:', error);
    }
  }

  // Load all threads for an agent from server API
  static async loadAllThreads(agentId: string): Promise<ChatThread[]> {
    try {
      console.log('📂 Loading all threads from server for agent:', agentId);
      
      // Get proxy auth token
      const token = await AsyncStorage.getItem('proxy_auth_token');
      if (!token) {
        console.log('❌ No proxy auth token found');
        return [];
      }

      // API credentials (stable values)
      const companyId = '870623';
      const userId = '36jowpr17';
      
      // Construct API URL
      const apiUrl = `https://routes.msg91.com/api/proxy/${companyId}/${userId}/thread/${agentId}`;
      
      console.log('🌐 Fetching threads from:', apiUrl);
      
      // Make API call with exact curl headers
      const response = await fetch(apiUrl, {
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

      if (!response.ok) {
        console.log('❌ API response not ok:', response.status, response.statusText);
        return [];
      }

      const result = await response.json();
      console.log('📋 Server threads response:', JSON.stringify(result, null, 2));

      // Check if response is successful
      if (result.status === 'success' && result.data?.threads) {
        const serverThreads = result.data.threads;
        console.log('✅ Loaded', serverThreads.length, 'threads from server');
        
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
        console.log('❌ API response format error:', result);
        return [];
      }
      
    } catch (error) {
      console.log('❌ Error loading threads from server:', error);
      
      // Fallback to local threads if API fails
      console.log('🔄 Falling back to local threads...');
      return await this.loadLocalThreads(agentId);
    }
  }

  // Fallback: Load local threads (previous implementation)
  private static async loadLocalThreads(agentId: string): Promise<ChatThread[]> {
    try {
      console.log('📂 Loading local threads for agent:', agentId);
      
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
      console.log('📋 Loaded', threads.length, 'local threads for agent');
      
      return threads;
    } catch (error) {
      console.log('❌ Error loading local threads:', error);
      return [];
    }
  }
}
