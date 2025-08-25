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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
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
  
  const flatListRef = useRef<FlatList>(null);

  // Phase 1: Agent Config Loading (UI Bootstrap)
  useEffect(() => {
    loadAgentConfig();
    if (threadId) {
      loadThreadHistory(threadId);
    }
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
      // This would be the GET /chat?thread=<tid>&_rsc=... call
      // For now, we'll skip this as it requires Next.js RSC handling
    } catch (error) {
      console.log('❌ Thread History Load Error:', error);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || sendingMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setSendingMessage(true);

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
        
        setMessages(prev => [...prev, agentResponse]);
        console.log('🤖 Agent Response Added:', agentResponse.text);
        
        // Phase 5: Check if this was an action/tool execution
        if (responseData.message.includes('successfully sent') || 
            responseData.message.includes('email has been') ||
            responseData.message.includes('completed')) {
          console.log('🔧 ACTION EXECUTED: Tool/Integration used');
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
      setMessages(prev => [...prev, errorMessage]);
      
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#212121',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#374151',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
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
});

export default ChatScreen;
