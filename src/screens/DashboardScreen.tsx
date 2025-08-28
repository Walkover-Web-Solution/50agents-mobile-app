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
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [invitingMember, setInvitingMember] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteResults, setInviteResults] = useState<{ name: string; email: string }[]>([]);

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
              setInviteError(null);
              setInviteSuccess(null);
              setMemberEmail('');
              setInviteResults([]);
              setMembersModalVisible(true);
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
                  <View key={`${u.email}-${idx}`} style={styles.memberRow}>
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
    </SafeAreaView>
  );
};

export default DashboardScreen;