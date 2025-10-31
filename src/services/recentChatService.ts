import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentChatData {
  organizationId: string;
  agentId: string;
  lastThreadId: string;
  lastAccessTime: number;
  agentName?: string; // For debugging/display purposes
}

export class RecentChatService {
  
  /**
   * Generate storage key for recent chat
   */
  private static getStorageKey(organizationId: string, agentId: string): string {
    return `recent_chat_${organizationId}_${agentId}`;
  }

  /**
   * Save recent chat data for an organization + agent combination
   */
  static async saveRecentChat(
    organizationId: string,
    agentId: string,
    threadId: string,
    agentName?: string
  ): Promise<void> {
    try {
      const recentChatData: RecentChatData = {
        organizationId,
        agentId,
        lastThreadId: threadId,
        lastAccessTime: Date.now(),
        agentName
      };

      const key = this.getStorageKey(organizationId, agentId);
      await AsyncStorage.setItem(key, JSON.stringify(recentChatData));
      
      console.log('✅ [RecentChat] Saved recent chat:', {
        org: organizationId,
        agent: agentId,
        thread: threadId,
        name: agentName
      });
    } catch (error) {
      console.error('❌ [RecentChat] Failed to save recent chat:', error);
    }
  }

  /**
   * Get recent chat data for an organization + agent combination
   */
  static async getRecentChat(
    organizationId: string,
    agentId: string
  ): Promise<RecentChatData | null> {
    try {
      const key = this.getStorageKey(organizationId, agentId);
      const data = await AsyncStorage.getItem(key);
      
      if (!data) {
        console.log('ℹ️ [RecentChat] No recent chat found for:', { org: organizationId, agent: agentId });
        return null;
      }

      const recentChat: RecentChatData = JSON.parse(data);
      
      console.log('✅ [RecentChat] Found recent chat:', {
        org: recentChat.organizationId,
        agent: recentChat.agentId,
        thread: recentChat.lastThreadId,
        time: new Date(recentChat.lastAccessTime).toLocaleString()
      });
      
      return recentChat;
    } catch (error) {
      console.error('❌ [RecentChat] Failed to get recent chat:', error);
      return null;
    }
  }

  /**
   * Clear recent chat for specific organization + agent
   */
  static async clearRecentChat(organizationId: string, agentId: string): Promise<void> {
    try {
      const key = this.getStorageKey(organizationId, agentId);
      await AsyncStorage.removeItem(key);
      
      console.log('🗑️ [RecentChat] Cleared recent chat for:', { org: organizationId, agent: agentId });
    } catch (error) {
      console.error('❌ [RecentChat] Failed to clear recent chat:', error);
    }
  }

  /**
   * Clear all recent chats for an organization (when switching orgs)
   */
  static async clearAllRecentChatsForOrg(organizationId: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const orgKeys = allKeys.filter(key => 
        key.startsWith(`recent_chat_${organizationId}_`)
      );
      
      if (orgKeys.length > 0) {
        await AsyncStorage.multiRemove(orgKeys);
        console.log('🗑️ [RecentChat] Cleared all recent chats for org:', organizationId, `(${orgKeys.length} chats)`);
      }
    } catch (error) {
      console.error('❌ [RecentChat] Failed to clear org recent chats:', error);
    }
  }

  /**
   * Get all recent chats for debugging
   */
  static async getAllRecentChats(): Promise<RecentChatData[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const recentChatKeys = allKeys.filter(key => key.startsWith('recent_chat_'));
      
      const recentChats: RecentChatData[] = [];
      
      for (const key of recentChatKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          recentChats.push(JSON.parse(data));
        }
      }
      
      return recentChats.sort((a, b) => b.lastAccessTime - a.lastAccessTime);
    } catch (error) {
      console.error('❌ [RecentChat] Failed to get all recent chats:', error);
      return [];
    }
  }

  /**
   * Check if recent chat exists and is valid
   */
  static async hasRecentChat(organizationId: string, agentId: string): Promise<boolean> {
    const recentChat = await this.getRecentChat(organizationId, agentId);
    return recentChat !== null && recentChat.lastThreadId !== null;
  }
  /**
 * Get the most recent chat for an organization (any agent)
 */
static async getMostRecentChatForOrg(organizationId: string): Promise<RecentChatData | null> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const orgKeys = allKeys.filter(key => 
        key.startsWith(`recent_chat_${organizationId}_`)
      );
      
      if (orgKeys.length === 0) {
        console.log('ℹ️ [RecentChat] No recent chats found for org:', organizationId);
        return null;
      }
  
      let mostRecentChat: RecentChatData | null = null;
      let latestTime = 0;
  
      for (const key of orgKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const chatData: RecentChatData = JSON.parse(data);
          if (chatData.lastAccessTime > latestTime) {
            latestTime = chatData.lastAccessTime;
            mostRecentChat = chatData;
          }
        }
      }
  
      if (mostRecentChat) {
        console.log('✅ [RecentChat] Found most recent chat for org:', {
          org: organizationId,
          agent: mostRecentChat.agentId,
          thread: mostRecentChat.lastThreadId,
          time: new Date(mostRecentChat.lastAccessTime).toLocaleString()
        });
      }
  
      return mostRecentChat;
    } catch (error) {
      console.error('❌ [RecentChat] Failed to get most recent chat for org:', error);
      return null;
    }
  }
}
