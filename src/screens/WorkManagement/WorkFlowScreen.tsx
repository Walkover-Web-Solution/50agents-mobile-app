import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import workflowStyles from '../../styles/WorkManagement/WorkFlowScreen.styles';

const styles = workflowStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'WorkFlow'>;
type WorkFlowRouteProp = RouteProp<RootStackParamList, 'WorkFlow'>;

interface WorkFlowScreenProps {
  onClose?: () => void;
  organizationName?: string;
  onNavigate?: (screenName: string, params?: any) => void;
}

const WorkFlowScreen = (props?: WorkFlowScreenProps) => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<WorkFlowRouteProp>();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  
  const organizationName = props?.organizationName || route?.params?.organizationName || 'Workspace';

  // Cleanup on unmount - ensure proper gesture handler cleanup
  useEffect(() => {
    return () => {
      console.log('🧹 WorkFlowScreen unmounting - cleaning up');
      setIsNavigating(false);
      setIsVisible(false);
    };
  }, []);

  const mainMenuItems = [
    { id: '1', icon: 'view-dashboard', label: 'Dashboard', color: '#6366f1', action: 'dashboard' },
    { id: '2', icon: 'folder-multiple', label: 'Manage Categories', color: '#8b5cf6' },
    { id: '3', icon: 'eye', label: 'Manage Views', color: '#06b6d4' },
    { id: '4', icon: 'tag-multiple', label: 'Manage Tags', color: '#f59e0b' },
  ];

  const workCategories = [
    { id: '1', icon: 'heart', label: 'Approved Ideas', color: '#ec4899' },
    { id: '2', icon: 'lightbulb', label: 'Ideas', color: '#f59e0b' },
  ];

  const views = [
    { id: '1', icon: 'account', label: 'My Work Items', color: '#3b82f6' },
    { id: '2', icon: 'progress-check', label: 'In Progress Tasks', color: '#10b981' },
  ];

  const handleMenuItemPress = useCallback((item: any) => {
    // Prevent multiple rapid navigation attempts
    if (isNavigating) {
      console.warn('Navigation already in progress');
      return;
    }

    try {
      setIsNavigating(true);
      
      console.log(`📍 Menu item pressed: ${item.label}`, {
        platform: Platform.OS,
        organizationName,
        action: item.action,
        hasOnNavigate: !!props?.onNavigate
      });

      let screenName: string | null = null;
      let params: any = { organizationName };

      // Determine navigation target
      if (item.action === 'dashboard') {
        console.log('🎯 Dashboard action detected');
        screenName = 'WorkItems';
      } else if (item.label === 'Manage Categories') {
        screenName = 'ManageCategories';
      } else if (item.label === 'Manage Views') {
        screenName = 'ManageViews';
      } else if (item.label === 'Manage Tags') {
        screenName = 'ManageTags';
      } else if (item.label === 'Approved Ideas') {
        screenName = 'CategoryItems';
        params = { 
          ...params,
          categoryId: 43, 
          categoryName: 'Approved Ideas'
        };
      } else if (item.label === 'Ideas') {
        screenName = 'CategoryItems';
        params = { 
          ...params,
          categoryId: 17, 
          categoryName: 'Ideas'
        };
      } else if (item.label === 'In Progress Tasks') {
        screenName = 'FilteredWorkItems';
        params = { 
          ...params,
          filterType: 'status',
          filterValue: 'IN_PROGRESS',
          filterLabel: 'In Progress Tasks'
        };
      } else if (item.label === 'My Work Items') {
        screenName = 'FilteredWorkItems';
        params = { 
          ...params,
          filterType: 'assignee',
          filterValue: 'me',
          filterLabel: 'My Work Items'
        };
      } else {
        console.warn('⚠️ Unknown menu item:', item.label);
        setIsNavigating(false);
        return;
      }

      // Use onNavigate callback if available (closes modal first on iOS)
      if (props?.onNavigate && screenName) {
        console.log(`✅ Using onNavigate callback for ${screenName}`);
        props.onNavigate(screenName, params);
      } else if (navigation && screenName) {
        console.log(`✅ Using direct navigation for ${screenName}`);
        navigation.navigate(screenName as any, params);
      } else {
        console.error('❌ No navigation method available');
        Alert.alert('Error', 'Navigation failed. Please try again.');
      }

      // Reset navigation flag after a short delay
      setTimeout(() => setIsNavigating(false), 500);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate. Please try again.');
      setIsNavigating(false);
    }
  }, [navigation, organizationName, isNavigating, props]);

  const renderMenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      activeOpacity={0.7}
      onPress={() => handleMenuItemPress(item)}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
        <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
      </View>
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const { width } = Dimensions.get('window');
  const sidebarWidth = width * 0.75;

  return (
    <View 
      style={{ 
        flex: 1, 
        flexDirection: 'row',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      {/* Sidebar on left */}
      <View 
        style={{ 
          width: sidebarWidth,
          pointerEvents: 'auto'
        }}
      >
        <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#fff"
          translucent={false}
        />

        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            try {
              console.log('🔙 Back button pressed');
              setIsVisible(false);
              
              // Small delay to allow state update before navigation
              setTimeout(() => {
                if (props?.onClose) {
                  console.log('📞 Calling onClose callback');
                  props.onClose();
                } else if (navigation?.canGoBack?.()) {
                  console.log('🔙 Calling navigation.goBack()');
                  navigation.goBack();
                } else {
                  console.warn('Cannot go back - no navigation history');
                }
              }, 50);
            } catch (error) {
              console.error('Back button error:', error);
              setIsVisible(true);
            }
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WorkFlow</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workspace Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>WORKSPACE</Text>
          <TouchableOpacity style={styles.workspaceItem} activeOpacity={0.7}>
            <View style={styles.workspaceIcon}>
              <MaterialCommunityIcons name="office-building" size={20} color="#fff" />
            </View>
            <View style={styles.workspaceInfo}>
              <Text style={styles.workspaceName}>{organizationName}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Main Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MAIN MENU</Text>
          <FlatList
            data={mainMenuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Work Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>WORK CATEGORIES</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ManageCategories', { organizationName })}
              >
                <MaterialCommunityIcons name="cog" size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={{ marginLeft: 12 }}
                onPress={() => navigation.navigate('ManageCategories', { organizationName, openAddModal: true })}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={workCategories}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Views */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>VIEWS</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ManageViews', { organizationName })}
              >
                <MaterialCommunityIcons name="cog" size={18} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={{ marginLeft: 12 }}
                onPress={() => navigation.navigate('ManageViews', { organizationName, openAddModal: true })}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            data={views}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Bottom Menu Items */}
        <View style={styles.section}>
          {/* Workspace Settings with Dropdown */}
          <Pressable 
            onPress={() => {
              if (showSettingsDropdown) {
                setShowSettingsDropdown(false);
              }
            }}
          >
            <View style={{ position: 'relative' }}>
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={() => setShowSettingsDropdown(!showSettingsDropdown)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#64748b20' }]}>
                  <MaterialCommunityIcons name="cog" size={20} color="#64748b" />
                </View>
                <Text style={styles.menuItemText}>Workspace Settings</Text>
                <MaterialCommunityIcons 
                  name={showSettingsDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>

              {/* Settings Dropdown Menu */}
              {showSettingsDropdown && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      console.log('⚡ Automations clicked');
                      setShowSettingsDropdown(false);
                      
                      if (props?.onNavigate) {
                        props.onNavigate('Automations', { organizationName });
                      } else if (navigation) {
                        navigation.navigate('Automations' as any, { organizationName });
                      }
                    }}
                  >
                    <MaterialCommunityIcons name="lightning-bolt" size={18} color="#64748b" />
                    <Text style={styles.dropdownItemText}>Automations</Text>
                  </TouchableOpacity>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      console.log('🔑 API Keys clicked');
                      setShowSettingsDropdown(false);
                      
                      if (props?.onNavigate) {
                        props.onNavigate('APIKeys', { organizationName });
                      } else if (navigation) {
                        navigation.navigate('APIKeys' as any, { organizationName });
                      }
                    }}
                  >
                    <MaterialCommunityIcons name="key" size={18} color="#64748b" />
                    <Text style={styles.dropdownItemText}>API Keys</Text>
                  </TouchableOpacity>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={() => {
                      console.log('🪝 Webhooks clicked');
                      setShowSettingsDropdown(false);
                      
                      if (props?.onNavigate) {
                        props.onNavigate('Webhooks', { organizationName });
                      } else if (navigation) {
                        navigation.navigate('Webhooks' as any, { organizationName });
                      }
                    }}
                  >
                    <MaterialCommunityIcons name="webhook" size={18} color="#64748b" />
                    <Text style={styles.dropdownItemText}>Webhooks</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Pressable>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => {
              console.log('💡 Ideas & Improvements clicked');
              Linking.openURL('https://work.50agents.com/feedback').catch(err => {
                console.error('Failed to open feedback link:', err);
                Alert.alert('Error', 'Could not open feedback link');
              });
            }}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#64748b20' }]}>
              <MaterialCommunityIcons name="checkbox-marked-outline" size={20} color="#64748b" />
            </View>
            <Text style={styles.menuItemText}>Ideas & Improvements</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
        </SafeAreaView>
      </View>

      {/* 
        NOTE: Overlay removed - handled by parent WorkItemsScreen Modal
        This prevents double overlay blocking gesture responder chain
      */}
    </View>
  );
};

export default WorkFlowScreen;
