import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Clipboard,
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
import apiKeysStyles from '../../styles/WorkManagement/APIKeysScreen.styles';
import { APIKeyService, APIKey } from '../../services/workManagementService';
import CreateAPIKeyModal from '../../components/CreateAPIKeyModal';

const styles = apiKeysStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'APIKeys'>;
type APIKeysRouteProp = RouteProp<RootStackParamList, 'APIKeys'>;

interface APIKeysScreenProps {
  onClose?: () => void;
  organizationName?: string;
  onNavigate?: (screenName: string, params?: any) => void;
}

const APIKeysScreen = (props?: APIKeysScreenProps) => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<APIKeysRouteProp>();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const organizationName = props?.organizationName || route?.params?.organizationName || 'Workspace';

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔑 Loading API keys...');
      
      const data = await APIKeyService.getAPIKeys();
      setApiKeys(data);
      console.log('✅ API keys loaded:', data.length);
    } catch (err: any) {
      console.error('❌ Error loading API keys:', err);
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newKey: APIKey) => {
    setApiKeys([newKey, ...apiKeys]);
  };

  const handleCopyAuthKey = (authkey: string, name: string) => {
    Clipboard.setString(authkey);
    Alert.alert('Copied', `Auth key for "${name}" copied to clipboard`);
  };

  const handleDeleteAPIKey = (apiKey: APIKey) => {
    Alert.alert(
      'Delete API Key',
      `Are you sure you want to delete "${apiKey.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await APIKeyService.deleteAPIKey(apiKey.id);
              setApiKeys(apiKeys.filter(k => k.id !== apiKey.id));
              Alert.alert('Success', 'API key deleted successfully');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete API key');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔑</Text>
      <Text style={styles.emptyText}>No API Keys Yet</Text>
      <Text style={styles.emptySubtext}>
        Create your first API key to access Work Management APIs
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.loadingText}>Loading API keys...</Text>
    </View>
  );

  const renderAPIKeyRow = (apiKey: APIKey) => (
    <View key={apiKey.id} style={styles.apiKeyRow}>
      <Text style={[styles.nameText, styles.nameColumn]}>{apiKey.name}</Text>
      
      <Text style={[styles.authkeyText, styles.authkeyColumn]}>
        {APIKeyService.maskAuthKey(apiKey.authkey)}
      </Text>
      
      <Text style={[styles.createdText, styles.createdColumn]}>
        {formatDate(apiKey.created_at)}
      </Text>
      
      <View style={[styles.actionButtons, styles.actionsColumn]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.copyButton]}
          onPress={() => handleCopyAuthKey(apiKey.authkey, apiKey.name)}
        >
          <MaterialCommunityIcons name="content-copy" size={16} color="#6366f1" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAPIKey(apiKey)}
        >
          <MaterialCommunityIcons name="trash-can" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>API Keys</Text>
            <Text style={styles.headerSubtitle}>
              Generate secure project-level keys to run Work Management APIs.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.createButtonText}>Create API Key</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        renderLoadingState()
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error Loading API Keys</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={loadAPIKeys}
          >
            <Text style={styles.createButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : apiKeys.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
              <Text style={[styles.tableHeaderText, styles.authkeyColumn]}>Authkey</Text>
              <Text style={[styles.tableHeaderText, styles.createdColumn]}>Created At</Text>
              <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Actions</Text>
            </View>

            {/* API Key Rows */}
            {apiKeys.map(renderAPIKeyRow)}
          </View>
        </ScrollView>
      )}

      {/* Create API Key Modal */}
      <CreateAPIKeyModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </SafeAreaView>
  );
};

export default APIKeysScreen;
