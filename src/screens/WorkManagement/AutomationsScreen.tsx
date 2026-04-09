import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  FlatList,
  ActivityIndicator,
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
import { RootStackParamList } from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import automationStyles from '../../styles/WorkManagement/AutomationsScreen.styles';
import { AutomationService, Automation } from '../../services/workManagementService';
import AddAutomationModal from '../../components/AddAutomationModal';
import EditAutomationModal from '../../components/EditAutomationModal';

const styles = automationStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Automations'>;
type AutomationsRouteProp = RouteProp<RootStackParamList, 'Automations'>;

interface AutomationsScreenProps {
  onClose?: () => void;
  organizationName?: string;
  onNavigate?: (screenName: string, params?: any) => void;
}

const AutomationsScreen = (props?: AutomationsScreenProps) => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<AutomationsRouteProp>();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const organizationName = props?.organizationName || route?.params?.organizationName || 'Workspace';

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('⚡ Loading automations...');
      
      const data = await AutomationService.getAutomations();
      setAutomations(data);
      console.log('✅ Automations loaded:', data.length);
    } catch (err: any) {
      console.error('❌ Error loading automations:', err);
      setError(err.message || 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAutomation = (automation: Automation) => {
    console.log('✏️ Edit automation:', automation.id);
    setSelectedAutomation(automation);
    setShowEditModal(true);
  };

  const handleDeleteAutomation = (automation: Automation) => {
    Alert.alert(
      'Delete Automation',
      `Are you sure you want to delete "${automation.name}"?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await AutomationService.deleteAutomation(automation.id);
              setAutomations(automations.filter(a => a.id !== automation.id));
              Alert.alert('Success', 'Automation deleted successfully');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete automation');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleCreateAutomation = () => {
    console.log('➕ Create new automation');
    setShowAddModal(true);
  };

  const handleAddSuccess = (newAutomation: Automation) => {
    setAutomations([newAutomation, ...automations]);
  };

  const handleEditSuccess = (updatedAutomation: Automation) => {
    setAutomations(
      automations.map(a => a.id === updatedAutomation.id ? updatedAutomation : a)
    );
  };

  const renderAutomationItem = ({ item }: { item: Automation }) => (
    <View style={styles.automationItem}>
      <View style={styles.automationIcon}>
        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#10b981" />
      </View>
      
      <View style={styles.automationContent}>
        <Text style={styles.automationName}>{item.name}</Text>
        <Text style={styles.automationTrigger}>
          {item.conditionLabel || 'No trigger configured'}
        </Text>
        <Text style={styles.automationLabel}>
          {item.promptTemplate || 'No action configured'}
        </Text>
      </View>

      <View style={styles.automationActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditAutomation(item)}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAutomation(item)}
        >
          <MaterialCommunityIcons name="trash-can" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚡</Text>
      <Text style={styles.emptyText}>No Automations Yet</Text>
      <Text style={styles.emptySubtext}>
        Create your first automation to manage AI-powered workflows
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.loadingText}>Loading automations...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (props?.onClose) {
                props.onClose();
              } else if (navigation?.canGoBack?.()) {
                navigation.goBack();
              }
            }}
          >
            <Feather name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Automations</Text>
            <Text style={styles.headerSubtitle}>
              Manage AI-powered workflows and autonomous agents
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.newButton}
          onPress={handleCreateAutomation}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        renderLoadingState()
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error Loading Automations</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.newButton}
            onPress={loadAutomations}
          >
            <Text style={styles.newButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : automations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={automations}
          renderItem={renderAutomationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.content}
          scrollEnabled={true}
        />
      )}

      {/* Add Automation Modal */}
      <AddAutomationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Automation Modal */}
      <EditAutomationModal
        visible={showEditModal}
        automation={selectedAutomation}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAutomation(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </SafeAreaView>
  );
};

export default AutomationsScreen;
