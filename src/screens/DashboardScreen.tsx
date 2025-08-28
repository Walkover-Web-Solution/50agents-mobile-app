import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getToken, logout as appLogout } from '../utils/auth';
import { DashboardService, Agent } from '../services/dashboardService';
// Alternative import if default import fails:
// import DashboardService from '../services/dashboardService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dashboardStyles as styles } from '../styles/DashboardScreen.styles';
import { getAvatarColor, getAvatarInitials } from '../utils/avatarUtils';
import { OrganizationService } from '../services/organizationService';

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
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [createOrgModalVisible, setCreateOrgModalVisible] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);

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
        console.log(' No token found, redirecting to login');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }

      // API credentials - get from stored organization data
      if (!organizationId) {
        console.error(' [UI] No organizationId provided from navigation');
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

      console.log(' [UI] Loading dashboard data for Organization:', organizationId);
      console.log(' [UI] Using API credentials - Company:', apiCompanyId, 'User:', userId);
      console.log(' [UI] Target organization ID for switch:', targetOrgId);
      if (orgAgentMap) {
        console.log(' [UI] Available orgAgentMap:', orgAgentMap);
      }

      // Call service to switch org and fetch agents (combines switch-org + agents API calls)
      const allAgents = await DashboardService.switchOrgAndGetAgents(apiCompanyId, userId, targetOrgId);

      // Process agents using service helper (now async)
      const { myAssistant: processedMyAssistant, customAgents } = await DashboardService.processAgentsForDisplay(allAgents);

      // Filter agents based on organization ownership (now returns true for all orgs)
      const filteredAgents = DashboardService.filterAgentsByOrganization(customAgents, isOwnOrganization);

      // Update state
      setMyAssistant(processedMyAssistant);
      setAgents(filteredAgents);

      console.log(' [UI] Dashboard data loaded successfully');

    } catch (error: any) {
      console.error(' [UI] Dashboard error:', error.message);

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
      agentColor: getAvatarColor(agent.name), // Pass the same color
    });
  };

  const filteredAgents = getFilteredAgents();

  const renderAgent = ({ item }: { item: Agent }) => (
    <TouchableOpacity
      style={styles.agentItem}
      onPress={() => handleAgentPress(item)}
    >
      <View style={[styles.agentAvatar, { backgroundColor: getAvatarColor(item.name) }]}>
        <Text style={styles.agentInitial}>
          {getAvatarInitials(item.name)}
        </Text>
      </View>
      <Text style={styles.agentName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleCreateOrgSubmit = async () => {
    const trimmed = orgName.trim();
    if (!trimmed) {
      setCreateOrgError('Please enter an organization name');
      return;
    }
    try {
      setCreatingOrg(true);
      setCreateOrgError(null);
      await OrganizationService.createOrganization(trimmed);
      setCreateOrgModalVisible(false);
      setOrgName('');
      Alert.alert('Success', 'Organization created successfully.');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to create organization';
      setCreateOrgError(typeof msg === 'string' ? msg : 'Failed to create organization');
    } finally {
      setCreatingOrg(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1a1a1a"
        translucent={false}
      />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.organizationName}>{companyName}</Text>
          <TouchableOpacity
            style={styles.headerBackIconButton}
            onPress={() => navigation.navigate('OrganizationSelection')}
            activeOpacity={0.7}
          >
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Text style={styles.dropdownArrow}>︙</Text>
          </TouchableOpacity>
        </View>
        {dropdownVisible && (
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => {
              setDropdownVisible(false);
              // Handle Members option
            }}>
              <Text style={styles.dropdownItemIcon}>👥</Text>
              <Text style={styles.dropdownItemText}>Members</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => {
              setDropdownVisible(false);
              setCreateOrgModalVisible(true);
            }}>
              <Text style={styles.dropdownItemIcon}>+</Text>
              <Text style={styles.dropdownItemText}>Create Org</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={async () => {
              setDropdownVisible(false);
              Alert.alert(
                'Confirm Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await appLogout();
                      } finally {
                        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                      }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}>
               <Text style={styles.dropdownItemIcon}>↪</Text>
               <Text style={styles.dropdownItemText}>Logout</Text>
             </TouchableOpacity>
          </View>
        )}
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
          placeholder="Search agents..."
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
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No agents found</Text>
            </View>
          ) : null
        }
      />
      <Modal
        visible={createOrgModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setCreateOrgModalVisible(false);
          setOrgName('');
          setCreateOrgError(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Organization</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Organization name"
              placeholderTextColor="#666"
              value={orgName}
              onChangeText={(t) => {
                setOrgName(t);
                if (createOrgError) setCreateOrgError(null);
              }}
              autoFocus
            />
            {createOrgError ? (
              <Text style={styles.modalErrorText}>{createOrgError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCreateOrgModalVisible(false);
                  setOrgName('');
                  setCreateOrgError(null);
                }}
                disabled={creatingOrg}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateOrgSubmit}
                disabled={creatingOrg}
              >
                {creatingOrg ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;