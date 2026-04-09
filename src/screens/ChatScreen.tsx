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
  Clipboard,
} from 'react-native';
import {
  useNavigation, useRoute, RouteProp
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatAPI, Message, AgentDetails, ChatThread, ModelOption } from '../services/chatApi';
import { RecentChatService } from '../services/recentChatService';
import { chatStyles as styles, markdownTheme } from '../styles/ChatScreen.styles';
import { getAvatarColor, getAvatarInitials } from '../utils/avatarUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUserEmail } from '../utils/auth';
import Markdown from 'react-native-markdown-display';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useVoiceInput } from '../hooks/useVoiceInput';
type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

const ChatScreen = () => {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { agentId, agentName = 'Agent', agentColor, threadId, organizationId } = route.params;
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
  const [showSettingsButton, setShowSettingsButton] = useState(false); 
  // Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ name: '', instructions: '', slugName: '' });
  const [updatingAgent, setUpdatingAgent] = useState(false);
  // Settings modal gesture handling
  const settingsPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Optional: Add visual feedback during swipe
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 50 && gestureState.vy > 0.5) {
        // Swipe down detected - close modal
        closeSettingsModal();
      }
    },
  });

  // Phase 1: Agent Config Loading (UI Bootstrap)
   useEffect(() => {
    console.log('🔍 [ChatScreen] Component mounted with params:', {
      agentId,
      agentName, 
      organizationId,
      threadId
    });
    
    loadAgentConfig();
    loadUserInitials();
    loadAllThreads();
  }, []);

  // Phase 2: Load thread history after agent details are available
  useEffect(() => {
    if (threadId && agentDetails) {
      console.log('🔄 [ChatScreen] Loading thread history for recent chat:', threadId);
      loadThreadHistory(threadId);
    }
  }, [threadId, agentDetails]);
  
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
        
        
        
        const cleanName = namePart.replace(/\d+/g, ''); // Remove numbers
      
        
        // Try different splitting strategies
        let initials = '';
        
        // Strategy 1: Split by common separators
        const words = cleanName.split(/[._-]/);
        if (words.length >= 2 && words[0].length > 0 && words[1].length > 0) {
          initials = words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
        }
        // Strategy 2: For concatenated names like "kartikshrivastav"
        else if (cleanName.length >= 6) {
        
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
      setShowSettingsButton(isOwned);
      // Only load models if agent is owned by user
      if (isOwned) {
        const models = await ChatAPI.getAvailableModels();
        setAvailableModels(models);
      }
    } catch (error) {
      console.error('🚨 [ChatScreen] Error checking agent ownership:', error);
      setShowModelSwitch(false); // Hide model switch on error
      setShowSettingsButton(false);
    }
  };
  const { listening, partialText, startListening, stopListening, cancelListening, clearPartialText, testVoiceSetup, debugVoiceStatus } = useVoiceInput({
    onFinalText: (finalText) => {
      console.log('🎤 📝 Final text received in ChatScreen:', finalText);
      setInputText(finalText);
    },
    locale: 'en-US'
  });

  // Use ref to track if we should update input from voice
  const isVoiceActiveRef = useRef(false);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update input text smoothly during voice recognition
  useEffect(() => {
    if (listening && partialText) {
      isVoiceActiveRef.current = true;
      setInputText(partialText);
    } else if (!listening && isVoiceActiveRef.current) {
      isVoiceActiveRef.current = false;
    }
  }, [listening, partialText]);

  // 10 second timeout for voice recognition
  useEffect(() => {
    if (listening) {
      // Clear any existing timeout
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      
      // Set 10 second timeout
      voiceTimeoutRef.current = setTimeout(() => {
        console.log('🎤 ⏰ Voice timeout - stopping after 10 seconds of inactivity');
        stopListening();
      }, 5000);
    } else {
      // Clear timeout when listening stops
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
        voiceTimeoutRef.current = null;
      }
    }

    return () => {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, [listening]);

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (listening) {
        cancelListening();
      }
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, [listening]);
  useEffect(() => {
    checkAgentOwnership();
  }, [agentId]);
  // Save recent chat when thread ID changes
  useEffect(() => {
  if (currentThreadId && organizationId && agentId && agentName) {
    // Save this as the recent chat for this org + agent
    RecentChatService.saveRecentChat(organizationId, agentId, currentThreadId, agentName);
  }
}, [currentThreadId, organizationId, agentId, agentName]);
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

    // Stop voice recognition if it's still active
    if (listening) {
      await stopListening();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    const messageText = inputText.trim();
    setInputText('');
    
    // Clear voice input state
    clearPartialText();
    isVoiceActiveRef.current = false;
    
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
          if (organizationId && agentId && agentName) {
            console.log('💾 [ChatScreen] Saving new thread as recent chat:', {
              org: organizationId,
              agent: agentId,
              thread: response.threadId,
              name: agentName
            });
            await RecentChatService.saveRecentChat(organizationId, agentId, response.threadId, agentName);
            console.log('✅ [ChatScreen] Saved new thread as recent chat:', response.threadId);
          }
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

  const displayName = formatName(agentDetails?.name || agentName || 'Agent');

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
              {item.threadName || 
              (item.messages?.[0]?.text ? 
                item.messages[0].text.substring(0, 50) + (item.messages[0].text.length > 50 ? '...' : '') : 
                'New conversation'
              )
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
    setShowModelDropdown(false);
    
    if (!agentDetails) return;
    
    // Don't update if it's the same model
    if (agentDetails.llm?.service === option.service && agentDetails.llm?.model === option.id) {
      return;
    }
    
    setUpdatingModel(true);
    
    try {
      const success = await ChatAPI.updateAgentModel(agentId, option.service, option.id);
      
      if (success) {
        // Update local agent details
        setAgentDetails(prev => prev ? {
          ...prev,
          llm: {
            service: option.service,
            model: option.id
          }
        } : prev);
        
        console.log('✅ [ChatScreen] Model updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update model. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ [ChatScreen] Model update failed:', error);
      Alert.alert('Error', error.message || 'Failed to update model. Please try again.');
    } finally {
      setUpdatingModel(false);
    }
  };

  const openSettingsModal = () => {
    if (!agentDetails) return;
    
    // Populate form with current agent data
    setSettingsForm({
      name: agentDetails.name || '',
      instructions: agentDetails.instructions || '',
      slugName: agentDetails.slugName || ''
    });
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setSettingsForm({ name: '', instructions: '', slugName: '' });
  };

  const handleSaveSettings = async () => {
    if (!agentDetails) return;
    
    setUpdatingAgent(true);
    
    try {
      const updates: { name?: string; instructions?: string; slugName?: string } = {};
      
      // Only include changed fields
      if (settingsForm.name !== agentDetails.name) {
        updates.name = settingsForm.name;
      }
      if (settingsForm.instructions !== agentDetails.instructions) {
        updates.instructions = settingsForm.instructions;
      }
      if (settingsForm.slugName !== agentDetails.slugName) {
        updates.slugName = settingsForm.slugName;
      }
      
      // If no changes, just return
      if (Object.keys(updates).length === 0) {
        setUpdatingAgent(false);
        return;
      }
      
      const success = await ChatAPI.updateAgent(agentId, updates);
      
      if (success) {
        // Update local agent details
        setAgentDetails(prev => prev ? {
          ...prev,
          ...updates
        } : prev);
        
        console.log('✅ [ChatScreen] Agent settings auto-saved successfully');
      } else {
        console.error('❌ [ChatScreen] Failed to auto-save agent settings');
      }
    } catch (error: any) {
      console.error('❌ [ChatScreen] Settings auto-save failed:', error);
    } finally {
      setUpdatingAgent(false);
    }
  };

  useEffect(() => {
    if (!agentDetails || !settingsForm.name) return;
    
    const timeoutId = setTimeout(() => {
      handleSaveSettings();
    }, 1000); // Auto-save 1 second after user stops typing
    
    return () => clearTimeout(timeoutId);
  }, [settingsForm.name, settingsForm.instructions, settingsForm.slugName]);

  const copyEmailToClipboard = () => {
    const fullEmail = `${settingsForm.slugName}@50agents.com`;
    Clipboard.setString(fullEmail);
  
    console.log('✅ Email copied to clipboard:', fullEmail);
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
            onPress={() => setShowModelDropdown(prev => !prev)}
            disabled={updatingModel}
          >
            {updatingModel ? (
              <ActivityIndicator size="small" color="#f9fafb" />
            ) : (
              <Text style={styles.modelButtonText} numberOfLines={1}>
                {currentModelLabel || 'Model'}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Settings button (visible only for owned agents) */}
        {showModelSwitch && (
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={openSettingsModal}
          >
            <AntDesign name="setting" color="#f9fafb" size={18} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.threadsButton}
          onPress={() => setShowThreadsList(true)}
        >
           <Octicons name="three-bars" color="#fff" size={22} />
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

        
        
        
        {/* Input Container - Always show same input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.inputWrapper}>
               <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={listening ? "🎤 Now speak..." : "Type your message..."}
                    placeholderTextColor={listening ? "#2563eb" : "#6b7280"}
                    multiline
                    maxLength={1000}
                   />
       <TouchableOpacity
                    style={[styles.voiceButton, listening && { backgroundColor: '#2563eb' }]}
                    onPress={listening ? () => {
                      console.log('🎤 🛑 Stopping voice recognition...');
                      stopListening();
                    } : () => {
                      console.log('🎤 🔴 Voice button pressed - starting recognition...');
                      // Clear input text when starting voice recording
                      setInputText('');
                      startListening();
                    }}
              onLongPress={() => {
                console.log('🎤 🧪 Running voice debug...');
                debugVoiceStatus();
              }}
              accessibilityLabel="Voice input"
            >
              <MaterialIcons
                name="keyboard-voice" // Always show same icon
                size={18}
                color="#ffffff"
              />
</TouchableOpacity>
      <TouchableOpacity 
        style={[
          styles.sendButton,
          (inputText.trim() && !sendingMessage && !listening) ? styles.sendButtonActive : styles.sendButtonInactive
        ]}
        onPress={sendMessage}
        disabled={!inputText.trim() || sendingMessage || listening}
      >
        {sendingMessage ? (
          <ActivityIndicator size="small" color="#6b7280" />
        ) : (
          <AntDesign name="arrowup" size={18} color="#212121" />
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
                <Entypo name="cross" color="#fff" size={24} />
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
             <AntDesign name="plus" color="#fff" size={16} />
            <Text style={styles.newThreadText}>New Conversation</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={true}
        onRequestClose={closeSettingsModal}
      >
        <TouchableOpacity 
          style={styles.settingsModalBackdrop} 
          activeOpacity={1}
          onPress={closeSettingsModal}
        >
          <View style={styles.settingsModalContainer} {...settingsPanResponder.panHandlers}>
            <View style={styles.settingsModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Entypo name="cog" color="#fff" size={20} />
                <Text style={styles.settingsModalTitle}>Settings</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeSettingsModal}
              >
                  <Entypo name="cross" color="#fff" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.settingsFormGroup}>
              <Text style={styles.settingsLabel}>Assistant Name</Text>
              <TextInput
                style={styles.settingsInput}
                value={settingsForm.name}
                onChangeText={(text) => setSettingsForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter assistant name"
                placeholderTextColor="#6b7280"
              />
            </View>
            <View style={styles.settingsFormGroup}>
              <Text style={styles.settingsLabel}>Email Address</Text>
              <View style={styles.emailInputContainer}>
                <TextInput
                  style={styles.emailInput}
                  value={settingsForm.slugName}
                  onChangeText={(text) => setSettingsForm(prev => ({ ...prev, slugName: text }))}
                  placeholder="Enter prefix"
                  placeholderTextColor="#6b7280"
                />
                <Text style={styles.emailSuffix}>@50agents.com</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={copyEmailToClipboard}
                >
                  <Entypo name="copy" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <Text style={styles.settingsHelperText}>Only lowercase letters, numbers, and hyphens allowed</Text>
            </View>
            <View style={styles.settingsFormGroup}>
              <Text style={styles.settingsLabel}>Instructions</Text>
              <TextInput
                style={styles.settingsTextArea}
                value={settingsForm.instructions}
                onChangeText={(text) => setSettingsForm(prev => ({ ...prev, instructions: text }))}
                placeholder="Enter instructions for the assistant"
                placeholderTextColor="#6b7280"
                multiline
                maxLength={1000}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ChatScreen;
