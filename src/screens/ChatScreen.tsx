import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  PanResponder,
  Animated,
  Dimensions,
  Alert,
  Keyboard,
  StatusBar,
} from 'react-native';
import {
  useNavigation, useRoute, RouteProp
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatAPI, Message, AgentDetails, ChatThread, ModelOption } from '../services/chatApi';
import { chatStyles as styles, markdownTheme } from '../styles/ChatScreen.styles';
import { getAvatarColor, getAvatarInitials } from '../utils/avatarUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUserEmail } from '../utils/auth';
import Markdown from 'react-native-markdown-display';
import AntDesign from 'react-native-vector-icons/AntDesign';

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
  const [userInitials, setUserInitials] = useState<string>('U');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // Model switching state
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [showModelSwitch, setShowModelSwitch] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [updatingModel, setUpdatingModel] = useState(false);

  // Phase 1: Agent Config Loading (UI Bootstrap)
  useEffect(() => {
    loadAgentConfig();
    loadUserInitials();
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

  const loadUserInitials = async () => {
    try {
      const email = await getUserEmail();
      console.log('📧 User email for initials:', email);
      
      if (email) {
        // Extract name from email (before @)
        const namePart = email.split('@')[0];
        console.log('👤 Name part:', namePart);
        
        // For emails like "kartikshrivastav2004@gmail.com"
        // Remove numbers and extract meaningful name parts
        const cleanName = namePart.replace(/\d+/g, ''); // Remove numbers
        console.log('🧹 Clean name:', cleanName);
        
        // Try different splitting strategies
        let initials = '';
        
        // Strategy 1: Split by common separators
        const words = cleanName.split(/[._-]/);
        if (words.length >= 2 && words[0].length > 0 && words[1].length > 0) {
          initials = words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        // Strategy 2: For concatenated names like "kartikshrivastav"
        else if (cleanName.length >= 6) {
          // Split at 40% to catch end of first name
          // "kartikshrivastav" → split at position 6 → "kartik|shrivastav" → "K" + "S"
          const splitPoint = Math.floor(cleanName.length * 0.4);
          
          const firstInitial = cleanName.charAt(0).toUpperCase();
          const secondInitial = cleanName.charAt(splitPoint).toUpperCase();
          
          initials = firstInitial + secondInitial;
        }
        // Strategy 3: Fallback to first 2 characters
        else {
          initials = cleanName.substring(0, 2).toUpperCase();
        }
        
        console.log('✅ Generated initials:', initials);
        setUserInitials(initials);
      }
    } catch (error) {
      console.log('❌ Error loading user initials:', error);
      setUserInitials('U'); // Fallback
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

  const checkAgentOwnership = async () => {
    try {
      const isOwned = await ChatAPI.isAgentOwnedByUser(agentId);
      console.log('🔍 [ChatScreen] Agent is owned by user:', isOwned);
      setShowModelSwitch(isOwned);
      
      // Only load models if agent is owned by user
      if (isOwned) {
        const models = await ChatAPI.getAvailableModels();
        setAvailableModels(models);
      }
    } catch (error) {
      console.error('🚨 [ChatScreen] Error checking agent ownership:', error);
      setShowModelSwitch(false); // Hide model switch on error
    }
  };

  useEffect(() => {
    checkAgentOwnership();
  }, [agentId]);

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

    // Generate user initials dynamically from saved email
    const getUserInitials = () => {
      return userInitials;
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
              <Markdown style={markdownTheme}>{item.text}</Markdown>
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
              <Markdown style={markdownTheme}>{item.text}</Markdown>
            </View>
          </View>
        )}
      </>
    );
  };

  const renderWelcomeScreen = () => (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeTitle}>
        {displayName}
      </Text>
      <Text style={styles.welcomeSubtitle}>
        {agentDetails?.instructions || 'Your intelligent assistant for productivity and creativity'}
      </Text>
    </View>
  );

  // Helper function to capitalize names properly
  const formatName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const displayName = formatName(agentDetails?.name || agentName);

  const renderThreadItem = ({ item }: { item: ChatThread }) => {
    const translateX = new Animated.Value(0);
    
    const threadPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 20) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 100) {
          // Show delete confirmation
          deleteThread(item.tid, item.threadName || item.messages[0]?.text?.substring(0, 30) || 'New conversation');
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    return (
      <Animated.View 
        style={[
          styles.threadItemContainer,
          { transform: [{ translateX }] }
        ]}
        {...threadPanResponder.panHandlers}
      >
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
            {currentThreadId === item.tid && (
              <View style={styles.activeIndicator} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const deleteThread = (threadId: string, threadName: string) => {
    Alert.alert(
      'Delete Thread',
      `Are you sure you want to delete the thread "${threadName}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await ChatAPI.deleteThread(threadId);
              const updatedThreads = allThreads.filter(thread => thread.tid !== threadId);
              setAllThreads(updatedThreads);
              if (currentThreadId === threadId) {
                setCurrentThreadId(null);
                setMessages([]);
              }
            } catch (error) {
              console.log('❌ Error deleting thread:', error);
            }
          },
        },
      ],
    );
  };

  // Add pan responder for swipe to close modal
  const panY = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Close modal on swipe down
          Animated.timing(panY, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowThreadsList(false);
            panY.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const currentModelLabel = agentDetails?.llm?.model || 'Model';

  const handleModelSelect = async (option: ModelOption) => {
    try {
      console.log(' [ModelSwitch:UI] onSelect ->', { agentId, option });
      setUpdatingModel(true);
      const resp = await ChatAPI.updateAgentModel(agentId, option.id, option.service);
      if (resp.success) {
        setAgentDetails(prev => prev ? ({ ...prev, llm: { service: option.service, model: option.id } }) : prev);
        setShowModelDropdown(false);
      } else {
        Alert.alert('Model Update', resp.message || 'Unable to update model.');
      }
    } catch (e) {
      Alert.alert('Model Update', 'Failed to update the model.');
    } finally {
      setUpdatingModel(false);
    }
  };

  const toggleModelDropdownWithOwnership = async () => {
    if (updatingModel) return;
    try {
      setShowModelDropdown(prev => !prev);
    } finally {
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b7280" />
          <Text style={styles.loadingText}>Loading agent configuration...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1f2937" 
        translucent={true} 
      />
      
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: Platform.OS === 'android' ? insets.top + 14 : 14 
      }]}>        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.headerAvatar, { backgroundColor: getAvatarColor(displayName) }]}>            
            <Text style={styles.headerInitial}>
              {getAvatarInitials(displayName)}
            </Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
        </View>
        <View style={styles.headerSpacer} />

        {/* Model button (visible only for owned agents) */}
        {showModelSwitch && (
          <TouchableOpacity 
            style={styles.modelButton}
            onPress={toggleModelDropdownWithOwnership}
            disabled={updatingModel}
          >
            {updatingModel ? (
              <ActivityIndicator size="small" color="#f9fafb" />
            ) : (
              <Text style={styles.modelButtonText} numberOfLines={1}>
                {currentModelLabel}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.threadsButton}
          onPress={() => setShowThreadsList(true)}
        >
          <Text style={styles.threadsIcon}>≡</Text>
        </TouchableOpacity>
      </View>

      {/* Models dropdown (only for owned agents) */}
      {showModelSwitch && showModelDropdown && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowModelDropdown(false)}
          style={styles.dropdownBackdrop}
        >
          <View style={[styles.modelDropdown, { top: (Platform.OS === 'android' ? insets.top + 68 : insets.top + 60), right: 12 }]}>            
            <Text style={styles.modelDropdownTitle}>Switch model</Text>
            <FlatList
              data={availableModels}
              keyExtractor={(item) => `${item.service}:${item.id}`}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modelOption} onPress={() => handleModelSelect(item)}>
                  <Text style={styles.modelOptionText}>{item.name}</Text>
                  <Text style={styles.modelServiceTag}>{item.service}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyModels}>                  
                  <Text style={styles.emptyText}>No models available</Text>
                </View>
              )}
            />
          </View>
        </TouchableOpacity>
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 45 : 0}
      >
        {/* Messages or Welcome Screen */}
        <View style={styles.contentArea}>
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
              onContentSizeChange={() => {
                if (flatListRef.current && messages.length > 0) {
                  flatListRef.current.scrollToEnd({ animated: true });
                }
              }}
            />
          )}
        </View>

        {/* Input Container */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
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
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showThreadsList}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={() => setShowThreadsList(false)}
      >
        <Animated.View 
          style={[
            styles.threadsModal,
            { transform: [{ translateY: panY }] }
          ]}
          {...panResponder.panHandlers}
        >
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
            
          {/* Threads List */}
          <FlatList
            data={allThreads}
            keyExtractor={(item) => item.tid}
            style={styles.threadsList}
            contentContainerStyle={styles.threadsContainer}
            renderItem={renderThreadItem}
            ListEmptyComponent={() => (
              <View style={styles.emptyThreads}>
                <Text style={styles.emptyText}>No previous conversations</Text>
                <Text style={styles.emptySubtext}>Start a new conversation to see it here</Text>
              </View>
            )}
          />
            
          {/* New Thread Button - Moved to bottom */}
          <TouchableOpacity 
            style={styles.newThreadButton}
            onPress={createNewThread}
          >
            <Text style={styles.newThreadIcon}>+</Text>
            <Text style={styles.newThreadText}>New Conversation</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default ChatScreen;
