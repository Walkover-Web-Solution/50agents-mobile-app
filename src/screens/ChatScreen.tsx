import React, { useState, useEffect } from 'react';
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

const ChatScreen = () => {
  const navigation = useNavigation<ChatNavProp>();
  const route = useRoute<ChatRouteProp>();
  const { agentId, agentName, agentLogo } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch agent details on component mount
  useEffect(() => {
    fetchAgentDetails();
  }, []);

  const fetchAgentDetails = async () => {
    try {

      const response = await api.get(`/proxy/870623/36jowpr17/agent/${agentId}`);
      
      if (response.data.success && response.data.data) {
        const details = response.data.data;
        setAgentDetails(details);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: '1',
          text: `Hello! I'm ${details.name}. ${details.instructions || 'How can I help you today?'}`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
        

      }
    } catch (error) {

      // Fallback welcome message
      const fallbackMessage: Message = {
        id: '1',
        text: `Hello! I'm ${agentName}. How can I help you today?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
    } finally {
      setLoading(false);
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
      // Try chat API using the discovered endpoint pattern
      const chatEndpoint = `/proxy/870623/36jowpr17/chat/${agentDetails?.orgId}/${agentId}`;
      
      const chatPayload = {
        message: messageText,
        bridgeId: agentDetails?.bridgeId,
        agentId: agentId,
        orgId: agentDetails?.orgId
      };
      
      // Make API call to send message
      const response = await api.post(chatEndpoint, chatPayload);
      
      if (response.data.success && response.data.data) {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.data.message || response.data.data.response || 'Response received from agent',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, agentResponse]);

      } else {
        // Fallback response if API structure is different
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Message sent successfully! (Using ${agentDetails?.llm.model})`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallbackResponse]);

      }
      
      setSendingMessage(false);
      
    } catch (error) {

      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setSendingMessage(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.agentMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : styles.agentMessageText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.agentInfo}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentInitial}>
              {agentName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.agentName}>{agentName}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
      />

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              inputText.trim() && !sendingMessage ? styles.sendButtonActive : null,
              sendingMessage ? styles.sendButtonLoading : null
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
  },
  backArrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  agentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  agentInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 36,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1a73e8',
  },
  agentMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a2a2a',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  agentMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonActive: {
    backgroundColor: '#1a73e8',
  },
  sendButtonLoading: {
    backgroundColor: '#666',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
