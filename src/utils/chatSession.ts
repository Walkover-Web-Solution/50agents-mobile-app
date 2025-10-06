import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatSession {
  agentId: string;
  agentName: string;
  agentColor?: string;
  threadId?: string;
  organizationId: string;
  timestamp: number;
}

const CHAT_SESSION_KEY = 'current_chat_session';

export const saveChatSession = async (session: ChatSession): Promise<void> => {
  try {
    await AsyncStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
    console.log('💾 Chat session saved:', session);
  } catch (error) {
    console.error('❌ Failed to save chat session:', error);
  }
};

export const getChatSession = async (): Promise<ChatSession | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(CHAT_SESSION_KEY);
    if (sessionData) {
      const session: ChatSession = JSON.parse(sessionData);
      
      // Check if session is not too old (max 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const now = Date.now();
      
      if (now - session.timestamp < maxAge) {
        console.log('📱 Retrieved chat session:', session);
        return session;
      } else {
        console.log('⏰ Chat session expired, clearing...');
        await clearChatSession();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to get chat session:', error);
    return null;
  }
};

export const clearChatSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAT_SESSION_KEY);
    console.log('🗑️ Chat session cleared');
  } catch (error) {
    console.error('❌ Failed to clear chat session:', error);
  }
};

export const updateChatSessionTimestamp = async (): Promise<void> => {
  try {
    const session = await getChatSession();
    if (session) {
      session.timestamp = Date.now();
      await saveChatSession(session);
    }
  } catch (error) {
    console.error('❌ Failed to update chat session timestamp:', error);
  }
};
