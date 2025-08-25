import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AgentDetails {
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

interface ChatThread {
  tid: string;
  messages: Message[];
  agentId: string;
  createdAt: Date;
}

const ChatScreen = () => {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { agentId, agentName, agentColor, threadId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId || null);
  const [showThreadsList, setShowThreadsList] = useState(false);
  const [allThreads, setAllThreads] = useState<ChatThread[]>([]);
  
  const flatListRef = useRef<FlatList>(null);

  // Phase 1: Agent Config Loading (UI Bootstrap)
  useEffect(() => {
    loadAgentConfig();
    if (threadId) {
      loadThreadHistory(threadId);
    }
    loadAllThreads();
  }, []);

  const loadAgentConfig = async () => {
    try {
      console.log('🚀 PHASE 1: Loading Agent Config...');
      console.log('📋 Agent ID:', agentId);
      
      // Step 1: Load agent details
      const agentResponse = await api.get(`/proxy/870623/36jowpr17/agent/${agentId}`);
      
      if (agentResponse.data.success && agentResponse.data.data) {
        const details = agentResponse.data.data;
        setAgentDetails(details);
        
        console.log('✅ Agent Config Loaded:');
        console.log('🤖 Name:', details.name);
        console.log('🧠 LLM:', details.llm);
        console.log('📝 Instructions:', details.instructions);
        console.log('🌉 Bridge ID:', details.bridgeId);
        console.log('🏢 Org ID:', details.orgId);
      }
      
    } catch (error) {
      console.log('❌ Agent Config Load Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreadHistory = async (tid: string) => {
    try {
      console.log('🔄 Loading Thread History for:', tid);
      
      // Get organization ID and agent details for API call
      if (!agentDetails?.orgId) {
        console.log('⚠️ No orgId available, skipping thread history load');
        return;
      }
      
      const threadEndpoint = `https://chat.50agents.com/${agentDetails.orgId}/${agentId}/chat`;
      const params = new URLSearchParams({
        thread: tid,
        _rsc: '1mygd'
      });
      
      console.log('🌐 Thread API Endpoint:', `${threadEndpoint}?${params}`);
    
      // Get proxy auth token from storage
      const token = await AsyncStorage.getItem('proxy_auth_token');
      if (!token) {
        console.log('❌ No proxy auth token found');
        return;
      }
      
      // Make API call to load thread history
      const response = await fetch(`${threadEndpoint}?${params}`, {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
          'cache-control': 'no-cache',
          'cookie': `proxy_auth_token=${token}`,
          'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22orgId%22%2C%22' + agentDetails.orgId + '%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%5B%22assistantId%22%2C%22' + agentId + '%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22chat%22%2C%7B%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22thread%5C%22%3A%5C%22' + tid + '%5C%22%7D%22%2C%7B%7D%2C%22%2F' + agentDetails.orgId + '%2F' + agentId + '%2Fchat%3Fthread%3D' + tid + '%22%2C%22refresh%22%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
          'next-url': `/${agentDetails.orgId}/${agentId}/chat`,
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'referer': `https://chat.50agents.com/${agentDetails.orgId}/${agentId}/chat?thread=${tid}`,
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
        
        // Parse the Next.js RSC response to extract messages
        // This is complex as it's React Server Components format
        // For now, we'll try to extract any JSON-like message data
        try {
          // Look for message patterns in the RSC response
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
              setMessages(loadedMessages);
              
              // Save to local storage for offline access
              await saveThreadData(tid, loadedMessages);
              
              // Auto-scroll to bottom
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 500);
            }
          }
        } catch (parseError) {
          console.log('⚠️ Could not parse thread history, using local storage fallback');
        }
      } else {
        console.log('❌ Thread History API Error:', response.status, response.statusText);
      }
      
    } catch (error) {
      console.log('❌ Thread History Load Error:', error);
      // Fallback to local storage if API fails
      console.log('🔄 Falling back to local storage...');
    }
  };

  const saveThreadData = async (threadId: string, messages: Message[]) => {
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
  };

  const loadAllThreads = async () => {
    try {
      console.log('📂 Loading all threads for agent:', agentId);
      
      // Get all storage keys
      const allKeys = await AsyncStorage.getAllKeys();
      const threadKeys = allKeys.filter(key => key.startsWith(`thread_messages_`));
      
      const threads: ChatThread[] = [];
      
      for (const key of threadKeys) {
        try {
          const messagesData = await AsyncStorage.getItem(key);
          if (messagesData) {
            const messages = JSON.parse(messagesData);
            const threadId = key.replace('thread_messages_', '');
            
            // Check if this thread belongs to current agent
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
      
      // Sort threads by creation date (newest first)
      threads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setAllThreads(threads);
      console.log('📋 Loaded', threads.length, 'threads for agent');
      
    } catch (error) {
      console.log('❌ Error loading all threads:', error);
    }
  };

  const switchToThread = async (thread: ChatThread) => {
    try {
      console.log('🔄 Switching to thread:', thread.tid);
      
      setCurrentThreadId(thread.tid);
      setMessages(thread.messages);
      setShowThreadsList(false);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
      
    } catch (error) {
      console.log('❌ Error switching thread:', error);
    }
  };

  const createNewThread = () => {
    console.log('🆕 Creating new thread');
    setCurrentThreadId(null);
    setMessages([]);
    setShowThreadsList(false);
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || sendingMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const messageText = inputText.trim();
    setInputText('');
    setSendingMessage(true);

    // Add user message to state
    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      console.log('🚀 PHASE 2/4: Sending Message...');
      console.log('📝 User Message:', messageText);
      console.log('🧵 Current Thread ID:', currentThreadId);
      
      // Correct API endpoint as per your flow
      const chatEndpoint = currentThreadId 
        ? `/proxy/870623/36jowpr17/chat/message?tid=${currentThreadId}`
        : `/proxy/870623/36jowpr17/chat/message`;
      
      const chatPayload = {
        message: messageText,
        agent: agentId, // Use 'agent' instead of 'agentId' as per your flow
      };
      
      console.log('🌐 API Endpoint:', chatEndpoint);
      console.log('📦 Payload:', chatPayload);
      
      // Make API call to send message
      const response = await api.post(chatEndpoint, chatPayload);
      
      console.log('✅ API Response Status:', response.status);
      console.log('📨 Full Response:', response.data);
      
      if (response.data.status === 'success' && response.data.data) {
        const responseData = response.data.data;
        
        // Phase 2: New thread creation (first message)
        if (!currentThreadId && responseData.tid) {
          console.log('🆕 NEW THREAD CREATED:', responseData.tid);
          setCurrentThreadId(responseData.tid);
        }
        
        // Add agent response to messages
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responseData.message || 'Response received from agent',
          isUser: false,
          timestamp: new Date(),
        };
        
        // Update messages with agent response
        updatedMessages = [...updatedMessages, agentResponse];
        setMessages(updatedMessages);
        console.log('🤖 Agent Response Added:', agentResponse.text);
        
        // Phase 5: Check if this was an action/tool execution
        if (responseData.message.includes('successfully sent') || 
            responseData.message.includes('email has been') ||
            responseData.message.includes('completed')) {
          console.log('🔧 ACTION EXECUTED: Tool/Integration used');
        }
        
        // Save thread data after successful message exchange
        const threadIdToSave = currentThreadId || responseData.tid;
        if (threadIdToSave) {
          await saveThreadData(threadIdToSave, updatedMessages);
        }
        
      } else {
        throw new Error('Invalid response structure');
      }
      
    } catch (error: any) {
      console.log('❌ CHAT ERROR:', error);
      console.log('❌ Error Response:', error.response?.data);
      
      // Handle specific error codes
      if (error.response?.status === 429) {
        console.log('⏳ RATE LIMITED: Too many requests');
      } else if (error.response?.status === 400) {
        console.log('🔑 AUTH ERROR: Token/config issue');
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      
      updatedMessages = [...updatedMessages, errorMessage];
      setMessages(updatedMessages);
      
      // Save thread data even with error message
      if (currentThreadId) {
        await saveThreadData(currentThreadId, updatedMessages);
      }
      
    } finally {
      setSendingMessage(false);
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showDateSeparator = () => {
      if (index === 0) return true;
      const currentDate = new Date(item.timestamp).toDateString();
      const previousDate = new Date(messages[index - 1].timestamp).toDateString();
      return currentDate !== previousDate;
    };

    const formatTime = (timestamp: Date) => {
      return timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    const formatDate = (timestamp: Date) => {
      const today = new Date();
      const messageDate = new Date(timestamp);
      
      if (messageDate.toDateString() === today.toDateString()) {
        return 'Today';
      }
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      return messageDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    // Generate user initials (e.g., "KS" for Kartik Shrivastav)
    const getUserInitials = () => {
      return 'KS'; // You can make this dynamic based on user data
    };

    // Generate agent initials from agent name
    const getAgentInitials = () => {
      if (!agentDetails?.name) return 'AI';
      return agentDetails.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
    };

    return (
      <>
        {showDateSeparator() && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        {item.isUser ? (
          // USER MESSAGE - Web style: Header above bubble, right aligned
          <View style={styles.userMessageWrapper}>
            <View style={styles.userHeader}>
              <Text style={styles.userHeaderText}>You {formatTime(item.timestamp)}</Text>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>{getUserInitials()}</Text>
              </View>
            </View>
            <View style={styles.userBubble}>
              <Text style={styles.userMessageText}>
                {item.text}
              </Text>
            </View>
          </View>
        ) : (
          // AGENT MESSAGE - Web style: Header above bubble, left aligned  
          <View style={styles.agentMessageWrapper}>
            <View style={styles.agentHeader}>
              <View style={styles.agentAvatar}>
                <Text style={styles.agentInitial}>{getAgentInitials()}</Text>
              </View>
              <Text style={styles.agentHeaderText}>
                {agentDetails?.name || 'Assistant'} {formatTime(item.timestamp)}
              </Text>
            </View>
            <View style={styles.agentBubble}>
              <Text style={styles.agentMessageText}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
      </>
    );
  };

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>
        {agentDetails?.name || agentName}
      </Text>
      <Text style={styles.welcomeSubtitle}>
        {agentDetails?.instructions || 'Your intelligent assistant for productivity and creativity'}
      </Text>
      {agentDetails?.llm && (
        <Text style={styles.modelInfo}>
          Powered by {agentDetails.llm.service} {agentDetails.llm.model}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b7280" />
          <Text style={styles.loadingText}>Loading agent configuration...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerInitial}>
                {agentDetails?.name ? agentDetails.name.substring(0, 2).toUpperCase() : 'AI'}
              </Text>
            </View>
            <Text style={styles.headerTitle}>
              {agentDetails?.name || agentName}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
          <TouchableOpacity 
            style={styles.threadsButton}
            onPress={() => setShowThreadsList(true)}
          >
            <Text style={styles.threadsIcon}>🗂️</Text>
          </TouchableOpacity>
        </View>

        {/* Messages or Welcome Screen */}
        {messages.length === 0 ? (
          renderWelcomeScreen()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item, index }) => renderMessage({ item, index })}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#6b7280"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (inputText.trim() && !sendingMessage) ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : (
                <Text style={styles.sendIcon}>→</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.inputHint}>
            {currentThreadId ? `Thread: ${currentThreadId.substring(0, 8)}...` : 'Press Shift+Enter for a new line'}
          </Text>
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={showThreadsList}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowThreadsList(false)}
      >
        <SafeAreaView style={styles.threadsModal}>
          {/* Threads Modal Header */}
          <View style={styles.threadsHeader}>
            <Text style={styles.threadsTitle}>Chat History</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowThreadsList(false)}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>
          
          {/* New Thread Button */}
          <TouchableOpacity 
            style={styles.newThreadButton}
            onPress={createNewThread}
          >
            <Text style={styles.newThreadIcon}>+</Text>
            <Text style={styles.newThreadText}>New Conversation</Text>
          </TouchableOpacity>
          
          {/* Threads List */}
          <FlatList
            data={allThreads}
            keyExtractor={(item) => item.tid}
            style={styles.threadsList}
            contentContainerStyle={styles.threadsContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.threadItem,
                  currentThreadId === item.tid && styles.activeThreadItem
                ]}
                onPress={() => switchToThread(item)}
              >
                <View style={styles.threadInfo}>
                  <Text style={styles.threadTitle}>
                    {item.messages.length > 0 
                      ? item.messages[0].text.substring(0, 50) + (item.messages[0].text.length > 50 ? '...' : '')
                      : 'New conversation'
                    }
                  </Text>
                  <Text style={styles.threadDate}>
                    {item.createdAt.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.threadMeta}>
                  <Text style={styles.messageCount}>{item.messages.length}</Text>
                  {currentThreadId === item.tid && (
                    <View style={styles.activeIndicator} />
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyThreads}>
                <Text style={styles.emptyText}>No previous conversations</Text>
                <Text style={styles.emptySubtext}>Start a new conversation to see it here</Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
  },
  loadingText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  modelInfo: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  userMessageWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  userHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  userInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  userBubble: {
    borderRadius: 18,
    padding: 16,
    maxWidth: '85%',
    backgroundColor: '#2563eb',
    marginLeft: 16,
  },
  userMessageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  agentMessageWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  agentInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  agentHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
  },
  agentBubble: {
    borderRadius: 18,
    padding: 16,
    maxWidth: '85%',
    backgroundColor: '#374151',
    marginRight: 16,
  },
  agentMessageText: {
    fontSize: 16,
    color: '#ffffff',
  },
  inputContainer: {
    paddingHorizontal: 8,  // 20 se 8 kar do
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    backgroundColor: '#212121',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#374151',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: 0,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#ffffff',
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  dateSeparator: {
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f343a',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    marginRight: 8,
  },
  headerInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 32,
  },
  threadsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadsIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  threadsModal: {
    flex: 1,
    backgroundColor: '#212121',
  },
  threadsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f343a',
  },
  threadsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  newThreadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2563eb',
    borderRadius: 24,
  },
  newThreadIcon: {
    fontSize: 24,
    color: '#ffffff',
    marginRight: 8,
  },
  newThreadText: {
    fontSize: 16,
    color: '#ffffff',
  },
  threadsList: {
    flex: 1,
  },
  threadsContainer: {
    padding: 20,
  },
  threadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2f343a',
  },
  activeThreadItem: {
    backgroundColor: '#2563eb',
  },
  threadInfo: {
    flex: 1,
  },
  threadTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  threadDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  threadMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  messageCount: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
  emptyThreads: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});

export default ChatScreen;
