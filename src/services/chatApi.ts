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
  messages: Message[];
  agentId: string;
  createdAt: Date;
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

  // Load thread history from server
  static async loadThreadHistory(threadId: string, agentId: string, agentDetails: AgentDetails): Promise<Message[]> {
    try {
      console.log('🔄 Loading Thread History for:', threadId);
      
      if (!agentDetails?.orgId) {
        console.log('⚠️ No orgId available, skipping thread history load');
        return [];
      }
      
      const threadEndpoint = `https://chat.50agents.com/${agentDetails.orgId}/${agentId}/chat`;
      const params = new URLSearchParams({
        thread: threadId,
        _rsc: '1mygd'
      });
      
      console.log('🌐 Thread API Endpoint:', `${threadEndpoint}?${params}`);
    
      const token = await AsyncStorage.getItem('proxy_auth_token');
      if (!token) {
        console.log('❌ No proxy auth token found');
        return [];
      }
      
      const response = await fetch(`${threadEndpoint}?${params}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
          'cache-control': 'no-cache',
          'cookie': `proxy_auth_token=${token}`,
          'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22orgId%22%2C%22' + agentDetails.orgId + '%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%5B%22assistantId%22%2C%22' + agentId + '%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22chat%22%2C%7B%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22thread%5C%22%3A%5C%22' + threadId + '%5C%22%7D%22%2C%7B%7D%2C%22%2F' + agentDetails.orgId + '%2F' + agentId + '%2Fchat%3Fthread%3D' + threadId + '%22%2C%22refresh%22%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
          'next-url': `/${agentDetails.orgId}/${agentId}/chat`,
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'referer': `https://chat.50agents.com/${agentDetails.orgId}/${agentId}/chat?thread=${threadId}`,
          'rsc': '1',
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
        }
      });
      
      console.log('✅ Thread History Response Status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('📨 Thread History Response:', responseText.substring(0, 500) + '...');
        
        const messageMatches = responseText.match(/"text":"([^"]+)"/g);
        const timestampMatches = responseText.match(/"timestamp":"([^"]+)"/g);
        const userMatches = responseText.match(/"isUser":(true|false)/g);
        
        if (messageMatches && messageMatches.length > 0) {
          const loadedMessages: Message[] = [];
          
          for (let i = 0; i < messageMatches.length; i++) {
            const text = messageMatches[i].match(/"text":"([^"]+)"/)?.[1] || '';
            const isUser = userMatches?.[i]?.includes('true') || false;
            const timestamp = timestampMatches?.[i]?.match(/"timestamp":"([^"]+)"/)?.[1];
            
            if (text) {
              loadedMessages.push({
                id: `loaded_${i}`,
                text: text.replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                isUser,
                timestamp: timestamp ? new Date(timestamp) : new Date()
              });
            }
          }
          
          if (loadedMessages.length > 0) {
            console.log('💬 Loaded', loadedMessages.length, 'messages from server');
            return loadedMessages;
          }
        }
      } else {
        console.log('❌ Thread History API Error:', response.status, response.statusText);
      }
      
      return [];
      
    } catch (error) {
      console.log('❌ Thread History Load Error:', error);
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

  // Load all threads for an agent
  static async loadAllThreads(agentId: string): Promise<ChatThread[]> {
    try {
      console.log('📂 Loading all threads for agent:', agentId);
      
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
          console.log('❌ Error loading thread:', key, error);
        }
      }
      
      threads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      console.log('📋 Loaded', threads.length, 'threads for agent');
      
      return threads;
    } catch (error) {
      console.log('❌ Error loading all threads:', error);
      return [];
    }
  }
}
