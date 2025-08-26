import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
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
import { ChatAPI, Message, AgentDetails, ChatThread } from '../services/chatApi';
import { chatStyles as styles } from '../styles/ChatScreen.styles';
import { getAvatarColor, getAvatarInitials } from '../utils/avatarUtils';

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

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
      const details = await ChatAPI.loadAgentConfig(agentId);
      if (details) {
        setAgentDetails(details);
      }
    } catch (error) {
      console.log('❌ Agent Config Load Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreadHistory = async (tid: string) => {
    if (!agentDetails) return;
    
    try {
      const loadedMessages = await ChatAPI.loadThreadHistory(tid, agentId, agentDetails);
      
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
        
        // Save to local storage for offline access
        await ChatAPI.saveThreadData(tid, loadedMessages, agentId);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 500);
      }
    } catch (error) {
      console.log('❌ Thread History Load Error:', error);
    }
  };

  const saveThreadData = async (threadId: string, messages: Message[]) => {
    await ChatAPI.saveThreadData(threadId, messages, agentId);
  };

  const loadAllThreads = async () => {
    try {
      const threads = await ChatAPI.loadAllThreads(agentId);
      setAllThreads(threads);
    } catch (error) {
      console.log('❌ Error loading all threads:', error);
    }
  };

  const switchToThread = async (thread: ChatThread) => {
    try {
      setCurrentThreadId(thread.tid);
      setShowThreadsList(false);
      
      // If thread already has messages, use them, otherwise load from server
      if (thread.messages && thread.messages.length > 0) {
        setMessages(thread.messages);
      } else {
        setMessages([]); // Clear current messages while loading
        
        // Load thread messages from server API
        if (agentDetails) {
          // Use serverId (MongoDB _id) for messages API, not tid (middleware_id)
          const messageThreadId = thread.serverId || thread.tid;
          
          const loadedMessages = await ChatAPI.loadThreadHistory(messageThreadId, agentId, agentDetails);
          setMessages(loadedMessages);
          
          // Update the thread in our local list with loaded messages
          const updatedThread = { ...thread, messages: loadedMessages };
          await ChatAPI.saveThreadData(thread.tid, loadedMessages, agentId);
        }
      }
      
      // Auto-scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
      
    } catch (error) {
      console.log('❌ Error switching thread:', error);
    }
  };

  const createNewThread = () => {
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
      // For existing threads, find the serverId (MongoDB _id) to use for API calls
      let threadIdForAPI = currentThreadId;
      
      if (currentThreadId) {
        // Find the thread in allThreads to get serverId
        const currentThread = allThreads.find(thread => thread.tid === currentThreadId);
        if (currentThread && currentThread.serverId) {
          threadIdForAPI = currentThread.serverId;
        } else {
          console.log('⚠️ No serverId found for thread, using tid:', currentThreadId);
        }
      }
      
      const response = await ChatAPI.sendMessage(messageText, agentId, threadIdForAPI);
      
      if (response.success) {
        // Phase 2: New thread creation (first message)
        if (!currentThreadId && response.threadId) {
          console.log('🆕 NEW THREAD CREATED:', response.threadId);
          setCurrentThreadId(response.threadId);
        }
        
        // Add agent response to messages
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          isUser: false,
          timestamp: new Date(),
        };
        
        // Update messages with agent response
        updatedMessages = [...updatedMessages, agentResponse];
        setMessages(updatedMessages);
        
        // Save thread data after successful message exchange
        const threadIdToSave = currentThreadId || response.threadId;
        if (threadIdToSave) {
          await saveThreadData(threadIdToSave, updatedMessages);
        }
        
      } else {
        throw new Error('Message send failed');
      }
      
    } catch (error: any) {
      console.log('❌ Send Message Error:', error);
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
            <View style={[styles.headerAvatar, { backgroundColor: getAvatarColor(agentDetails?.name || agentName) }]}>
              <Text style={styles.headerInitial}>
                {getAvatarInitials(agentDetails?.name || agentName)}
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
            <Text style={styles.threadsIcon}>≡</Text>
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
                    {item.threadName 
                      ? item.threadName
                      : item.messages.length > 0 
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

export default ChatScreen;
