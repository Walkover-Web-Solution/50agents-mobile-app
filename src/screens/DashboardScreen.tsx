import React, { useState, useEffect } from 'react';
import {
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
import { dashboardStyles as styles } from '../styles/DashboardScreen.styles';

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

export default DashboardScreen;