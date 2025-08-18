import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getToken } from '../utils/auth';
import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
type DashboardRouteProp = RouteProp<RootStackParamList, 'Dashboard'>;

interface Agent {
  _id: string;
  name: string;
  logo?: string;
  unread?: number;
  createdBy?: string;
  editors?: string[];
  bridgeId?: string;
}

const DashboardScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<DashboardRouteProp>();
  const { companyName, companyId, organizationId } = route.params;
  



  const [agents, setAgents] = useState<Agent[]>([]);
  const [myAssistant, setMyAssistant] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if this is user's own organization
  const isOwnOrganization = companyName === 'Kartik Shrivastav';

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
      
      // API credentials (will be dynamic later)
      const apiCompanyId = '870623';
      const userId = '36jowpr17';
      

      
      // Use the pre-configured axios instance which already has the token
      const response = await api.get(`/proxy/${apiCompanyId}/${userId}/agent/`);
      
      if (response.status === 200) {
        const result = response.data;

        
        if (result.success && result.data?.agents) {
          const allAgents = result.data.agents;
          
          // First agent is always "My Assistant" (user's own agent)
          const firstAgent = allAgents[0];
          if (firstAgent) {
            setMyAssistant({
              ...firstAgent,
              name: 'My Assistant' // Override name for display
            });
          }
          
          // Rest are custom agents
          const customAgents = allAgents.slice(1);
          
          if (isOwnOrganization) {
            // Own organization: Show all custom agents
            setAgents(customAgents);
          } else {
            // Other organizations: Show no custom agents, only My Assistant
            setAgents([]);
          }
        }
      } else {
        console.log('❌ Dashboard API Failed:', response.status);
        console.log('Response data:', response.data);
        // No fallback data - show empty state
      }
    } catch (error: any) {
      console.error('Dashboard API Error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        companyId: companyId
      });
      
      // If 401 error, redirect to login
      if (error?.response?.status === 401) {
        console.log('Token expired, redirecting to login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
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
      agentLogo: agent.logo,
    });
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentItem}
      onPress={() => handleAgentPress(item)}
    >
      <View style={styles.agentAvatar}>
        <Text style={styles.agentInitial}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.agentName}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.organizationName}>{companyName}</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('OrganizationSelection')}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
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
          <View style={[styles.agentAvatar, styles.myAssistantAvatar]}>
            <Text style={styles.agentInitial}>
              {myAssistant.name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2)}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginLeft: 10,
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
    backgroundColor: '#4CAF50', // Green for My Assistant
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
    backgroundColor: '#6366f1', // Purple like in 50agents
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
