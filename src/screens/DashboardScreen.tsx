import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getToken } from '../utils/auth';
import { DashboardService, Agent } from '../services/dashboardService';
// Alternative import if default import fails:
// import DashboardService from '../services/dashboardService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DashboardRouteProp>();
  const { companyName, companyId, organizationId } = route.params;
  



  const [agents, setAgents] = useState<Agent[]>([]);
  const [myAssistant, setMyAssistant] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if this is user's own organization (with null safety)
  const isOwnOrganization = DashboardService.isUserOwnOrganization(companyName || '');

  /**
   * Get filtered agents based on search query
   */
  const getFilteredAgents = (): Agent[] => {
    return DashboardService.filterAgentsBySearch(agents, searchQuery);
  };

  const fetchDashboardAgents = async () => {
    try {
      setLoading(true);
      
      // Get token from AsyncStorage (same as other screens)
      const token = await getToken();
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      
      // API credentials - get from stored organization data
      if (!organizationId) {
        console.error('❌ [UI] No organizationId provided from navigation');
        throw new Error('Organization ID is required');
      }
      
      // Get stored user profile and orgAgentMap from switchOrganization API
      const userProfile = await AsyncStorage.getItem('userProfile');
      const orgAgentMapStr = await AsyncStorage.getItem('orgAgentMap');
      const userData = userProfile ? JSON.parse(userProfile) : null;
      const orgAgentMap = orgAgentMapStr ? JSON.parse(orgAgentMapStr) : null;
      
      // Use stable API credentials for URL - these are the main company credentials
      // organizationId should be passed as orgId parameter in request body, not in URL
      const apiCompanyId = '870623'; // Main company ID for API URL (stable)
      const userId = '36jowpr17'; // Main user ID for API URL (stable)
      const targetOrgId = organizationId; // This goes in request body as orgId parameter
      
      console.log('🔄 [UI] Loading dashboard data for Organization:', organizationId);
      console.log('🔄 [UI] Using API credentials - Company:', apiCompanyId, 'User:', userId);
      console.log('🎯 [UI] Target organization ID for switch:', targetOrgId);
      if (orgAgentMap) {
        console.log('🔄 [UI] Available orgAgentMap:', orgAgentMap);
      }
      
      // Call service to switch org and fetch agents (combines switch-org + agents API calls)
      const allAgents = await DashboardService.switchOrgAndGetAgents(apiCompanyId, userId, targetOrgId);
      
      // Process agents using service helper
      const { myAssistant: processedMyAssistant, customAgents } = DashboardService.processAgents(allAgents);
      
      // Filter agents based on organization ownership (now returns true for all orgs)
      const filteredAgents = DashboardService.filterAgentsByOrganization(customAgents, isOwnOrganization);
      
      // Update state
      setMyAssistant(processedMyAssistant);
      setAgents(filteredAgents);
      
      console.log('✅ [UI] Dashboard data loaded successfully');
      
    } catch (error: any) {
      console.error('🚨 [UI] Dashboard error:', error.message);
      
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardAgents();
  }, [companyName]); // Refetch when organization changes

  const handleAgentPress = (agent: Agent) => {

    navigation.navigate('Chat', {
      agentId: agent._id,
      agentName: agent.name,
      agentColor: getAgentColor(agent.name), // Pass the same color
    });
  };

  const filteredAgents = getFilteredAgents();

  /**
   * Generate consistent color for agent based on name
   */
  const getAgentColor = (name: string) => {
    const colors = [
      '#6366f1', // Purple
      '#3b82f6', // Blue  
      '#10b981', // Green
      '#f59e0b', // Orange
      '#ef4444', // Red
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#84cc16', // Lime
    ];
    
    // Generate consistent hash from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentItem}
      onPress={() => handleAgentPress(item)}
    >
      <View style={[styles.agentAvatar, { backgroundColor: getAgentColor(item.name) }]}>
        <Text style={styles.agentInitial}>
          {item.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.agentName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
          <Text style={styles.loadingSubText}>Switching organization...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('OrganizationSelection')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.organizationName}>{companyName}</Text>
        </View>
        <Text style={styles.subtitle}>
          {isOwnOrganization 
            ? 'Your agents and assistants' 
            : 'Available agents for this organization'
          }
        </Text>
      </View>


      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search agents... (Cmd+K)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>


      {myAssistant && (
        <TouchableOpacity 
          style={styles.myAssistantItem}
          onPress={() => handleAgentPress(myAssistant)}
        >
          <View style={[styles.agentAvatar, styles.myAssistantAvatar, { backgroundColor: getAgentColor(myAssistant.name) }]}>
            <Text style={styles.agentInitial}>
              {myAssistant.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.agentName}>{myAssistant.name}</Text>
        </TouchableOpacity>
      )}


      <FlatList
        data={filteredAgents}
        keyExtractor={(item) => item._id}
        renderItem={renderAgent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No agents found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark theme like 50agents
    paddingTop: 50,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    zIndex: 1000,
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  loadingSubText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 15,
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
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  myAssistantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  myAssistantAvatar: {
    // backgroundColor: '#4CAF50', // Green for My Assistant
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  agentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  agentInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  agentName: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default DashboardScreen;