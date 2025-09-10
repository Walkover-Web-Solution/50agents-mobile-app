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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

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
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [invitingMember, setInvitingMember] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteResults, setInviteResults] = useState<{ name: string; email: string }[]>([]);
  const [createAssistantModalVisible, setCreateAssistantModalVisible] = useState(false);
  const [assistantName, setAssistantName] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState('');
  const [creatingAssistant, setCreatingAssistant] = useState(false);
  const [createAssistantError, setCreateAssistantError] = useState<string | null>(null);

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
      const targetOrgId = organizationId; // This goes in request body as orgIarameter

      
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
    console.log(' [Dashboard] Open chat for agent:', { name: agent.name, _id: agent._id });
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

  const normalizeInviteResults = (res: any): { name: string; email: string }[] => {
    try {
      const candidates: any[] = [];
      if (Array.isArray(res)) candidates.push(...res);
      if (Array.isArray(res?.data)) candidates.push(...res.data);
      if (Array.isArray(res?.data?.users)) candidates.push(...res.data.users);
      if (Array.isArray(res?.data?.results)) candidates.push(...res.data.results);
      if (Array.isArray(res?.users)) candidates.push(...res.users);
      if (Array.isArray(res?.results)) candidates.push(...res.results);
      if (res?.user && typeof res.user === 'object') candidates.push(res.user);
      if (res?.data?.user && typeof res.data.user === 'object') candidates.push(res.data.user);
      if (res?.data && typeof res.data === 'object' && (res.data.email || res.data.mail || res.data.primaryEmail)) candidates.push(res.data);

      const seen = new Set<string>();
      const out: { name: string; email: string }[] = [];
      for (const u of candidates) {
        const name = String(u?.name || u?.fullName || u?.username || u?.displayName || '').trim();
        const email = String(u?.email || u?.mail || u?.primaryEmail || '').trim();
        if (email && !seen.has(email)) {
          out.push({ name: name || email, email });
          seen.add(email);
        }
      }
      return out;
    } catch { 
      return [];
    }
  };

  const handleInviteMemberSubmit = async () => {
    const email = memberEmail.trim();
    if (!email) {
      setInviteError('Please enter an email');
      return;
    }
    try {
      setInvitingMember(true);
      setInviteError(null);
      setInviteSuccess(null);
      const res = await OrganizationService.inviteUserByEmail(email);
      console.log(' [UI] inviteUserByEmail response:', JSON.stringify(res));
      const results = normalizeInviteResults(res);
      const list = results.length ? results : [{ name: email, email }];
      setInviteResults(list);
      setInviteSuccess(results.length ? 'Found matching users.' : 'Invite sent successfully.');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to invite/search';
      setInviteError(typeof msg === 'string' ? msg : 'Failed to invite/search');
    } finally {
      setInvitingMember(false);
    }
  };

  const handleCreateAssistant = async () => {
    const name = assistantName.trim();
    const instructions = assistantInstructions.trim() || 'You are a helpful AI assistant.';
    
    if (!name) {
      setCreateAssistantError('Please enter an assistant name');
      return;
    }
    
    try {
      setCreatingAssistant(true);
      setCreateAssistantError(null);
      
      // API credentials (same as other API calls)
      const apiCompanyId = '870623';
      const userId = '36jowpr17';
      
      // Create agent data matching the CURL structure
      const agentData = {
        name: name,
        instructions: instructions,
        llm: {
          service: 'openai',
          model: 'gpt-5' // Using gpt-5 as shown in original CURL command
        }
      };
      
      console.log('🚀 [UI] Creating assistant with data:', agentData);
      
      const response = await DashboardService.createAgent(apiCompanyId, userId, agentData);
      
      if (response.success) {
        console.log('✅ [UI] Assistant created successfully');
        
        // Close modal and reset form
        setCreateAssistantModalVisible(false);
        setAssistantName('');
        setAssistantInstructions('');
        setCreateAssistantError(null);
        
        // Refresh the agents list
        await fetchDashboardAgents();
        
        // Navigate directly to the newly created agent's chat
        if (response.data && response.data._id) {
          navigation.navigate('Chat', {
            agentId: response.data._id,
            agentName: response.data.name || name,
            agentColor: getAvatarColor(response.data.name || name),
          });
        }
        
        // Optional: Show brief success message
        // Alert.alert('Success', `Assistant "${name}" created successfully!`);
      }else {
        setCreateAssistantError(response.message || 'Failed to create assistant');
      }
      
    } catch (error: any) {
      console.error('🚨 [UI] Error creating assistant:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create assistant';
      setCreateAssistantError(errorMessage);
    } finally {
      setCreatingAssistant(false);
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
            <MaterialCommunityIcons name="swap-horizontal" color="#ffffff" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Entypo name="dots-three-vertical" color="#ffffff" size={22} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {isOwnOrganization
            ? 'Your agents and assistants'
            : 'Available agents for this organization'
          }
        </Text>
      </View>
      {/* Bottom Sheet for menu */}
      <Modal
        visible={dropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          {/* Tap outside to close */}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <TouchableOpacity
              style={styles.bottomSheetItem}
              onPress={() => {
                setDropdownVisible(false);
                setInviteError(null);
                setInviteSuccess(null);
                setMemberEmail('');
                setInviteResults([]);
                setMembersModalVisible(true);
              }}
            >
              <Ionicons name="people" style={styles.bottomSheetItemIcon} />
              <Text style={styles.bottomSheetItemText}>Members</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomSheetItem}
              onPress={() => {
                setDropdownVisible(false);
                setCreateOrgModalVisible(true);
              }}
            >
              <Feather name="plus" style={styles.bottomSheetItemIcon} />
              <Text style={styles.bottomSheetItemText}>Create Org</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomSheetItem, { borderBottomWidth: 0 }]}
              onPress={async () => {
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
              }}
            >
              <Feather name="log-out" color="#ff6b6b" style={styles.bottomSheetItemIcon} />
              <Text style={[styles.bottomSheetItemText, { color: '#ff6b6b' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
       
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
        keyExtractor={(item, index) => item?._id ? `agent_${item._id}` : `fallback_${index}`}
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
      {/* Members Modal */}
      <Modal
        visible={membersModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setMembersModalVisible(false);
          setMemberEmail('');
          setInviteError(null);
          setInviteSuccess(null);
          setInviteResults([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Members</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Invite or Search by email"
              placeholderTextColor="#666"
              value={memberEmail}
              onChangeText={(t) => {
                setMemberEmail(t);
                if (inviteError) setInviteError(null);
                if (inviteSuccess) setInviteSuccess(null);
                if (inviteResults.length) setInviteResults([]);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="search"
              onSubmitEditing={handleInviteMemberSubmit}
              autoFocus
            />
            {inviteError ? (
              <Text style={styles.modalErrorText}>{inviteError}</Text>
            ) : null}
            {inviteSuccess ? (
              <Text style={[styles.modalErrorText, { color: '#4ade80' }]}>{inviteSuccess}</Text>
            ) : null}
            {inviteResults.length > 0 && (
              <View style={styles.memberList}>
                {inviteResults.map((u, idx) => (
                  <View key={u.email || `${u.name || 'user'}-${idx}`} style={styles.memberRow}>
                    <Text style={styles.memberName}>{u.name}</Text>
                    <Text style={styles.memberEmail}>{u.email}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setMembersModalVisible(false);
                  setMemberEmail('');
                  setInviteError(null);
                  setInviteSuccess(null);
                  setInviteResults([]);
                }}
                disabled={invitingMember}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleInviteMemberSubmit}
                disabled={invitingMember}
              >
                {invitingMember ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Invite</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Create Assistant Modal */}
      <Modal
        visible={createAssistantModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setCreateAssistantModalVisible(false);
          setAssistantName('');
          setAssistantInstructions('');
          setCreateAssistantError(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Assistant</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Assistant name"
              placeholderTextColor="#666"
              value={assistantName}
              onChangeText={(t) => {
                setAssistantName(t);
                if (createAssistantError) setCreateAssistantError(null);
              }}
              autoFocus
            />
           <TextInput
  style={[styles.modalInput, styles.textAreaInput]}
  placeholder="Assistant Discription "
  placeholderTextColor="#666"
  value={assistantInstructions}
  onChangeText={(t) => {
    setAssistantInstructions(t);
    if (createAssistantError) setCreateAssistantError(null);
  }}
  multiline={true}
  numberOfLines={4}
  textAlignVertical="top"
  autoFocus={false}
/>
            {createAssistantError ? (
              <Text style={styles.modalErrorText}>{createAssistantError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setCreateAssistantModalVisible(false);
                  setAssistantName('');
                  setAssistantInstructions('');
                  setCreateAssistantError(null);
                }}
                disabled={creatingAssistant}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateAssistant}
                disabled={creatingAssistant}
              >
                {creatingAssistant ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          console.log('🔵 Floating button pressed!');
          setCreateAssistantModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <Entypo name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DashboardScreen;