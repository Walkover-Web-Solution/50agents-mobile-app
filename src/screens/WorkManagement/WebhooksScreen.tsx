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
import webhooksStyles from '../../styles/WorkManagement/WebhooksScreen.styles';
import { WebhookService, Webhook } from '../../services/workManagementService';
import CreateWebhookModal from '../../components/CreateWebhookModal';
import EditWebhookModal from '../../components/EditWebhookModal';

const styles = webhooksStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Webhooks'>;
type WebhooksRouteProp = RouteProp<RootStackParamList, 'Webhooks'>;

interface WebhooksScreenProps {
  onClose?: () => void;
  organizationName?: string;
  onNavigate?: (screenName: string, params?: any) => void;
}

const WebhooksScreen = (props?: WebhooksScreenProps) => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<WebhooksRouteProp>();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  const organizationName = props?.organizationName || route?.params?.organizationName || 'Workspace';

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🪝 Loading webhooks...');
      
      const data = await WebhookService.getWebhooks();
      setWebhooks(data);
      console.log('✅ Webhooks loaded:', data.length);
    } catch (err: any) {
      console.error('❌ Error loading webhooks:', err);
      setError(err.message || 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (newWebhook: Webhook) => {
    setWebhooks([newWebhook, ...webhooks]);
  };

  const handleEditSuccess = (updatedWebhook: Webhook) => {
    setWebhooks(webhooks.map(w => w.id === updatedWebhook.id ? updatedWebhook : w));
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowEditModal(true);
  };

  const handleDeleteWebhook = (webhook: Webhook) => {
    Alert.alert(
      'Delete Webhook',
      `Are you sure you want to delete "${webhook.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await WebhookService.deleteWebhook(webhook.id);
              setWebhooks(webhooks.filter(w => w.id !== webhook.id));
              Alert.alert('Success', 'Webhook deleted successfully');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete webhook');
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
      <Text style={styles.emptyIcon}>🪝</Text>
      <Text style={styles.emptyText}>No Webhooks Yet</Text>
      <Text style={styles.emptySubtext}>
        Create your first webhook to receive real-time event notifications
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.loadingText}>Loading webhooks...</Text>
    </View>
  );

  const renderWebhookRow = (webhook: Webhook) => (
    <View key={webhook.id} style={styles.webhookRow}>
      <Text style={[styles.nameText, styles.nameColumn]} numberOfLines={1}>
        {webhook.name}
      </Text>
      
      <Text style={[styles.urlText, styles.urlColumn]} numberOfLines={1}>
        {webhook.webhookUrl}
      </Text>
      
      <View style={[styles.statusColumn]}>
        <View style={[
          styles.statusBadge,
          webhook.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
        ]}>
          <Text style={[
            styles.statusText,
            webhook.isActive ? styles.statusTextActive : styles.statusTextInactive
          ]}>
            {webhook.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.createdText, styles.createdColumn]}>
        {formatDate(webhook.createdAt)}
      </Text>
      
      <View style={[styles.actionButtons, styles.actionsColumn]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditWebhook(webhook)}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#6366f1" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteWebhook(webhook)}
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
            <Text style={styles.headerTitle}>Webhooks</Text>
            <Text style={styles.headerSubtitle}>
              Receive real-time event notifications from your organization to external services.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={styles.createButtonText}>Create Webhook</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        renderLoadingState()
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Error Loading Webhooks</Text>
          <Text style={styles.emptySubtext}>{error}</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={loadWebhooks}
          >
            <Text style={styles.createButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : webhooks.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.nameColumn]}>Name</Text>
              <Text style={[styles.tableHeaderText, styles.urlColumn]}>URL</Text>
              <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
              <Text style={[styles.tableHeaderText, styles.createdColumn]}>Created</Text>
              <Text style={[styles.tableHeaderText, styles.actionsColumn]}>Actions</Text>
            </View>

            {/* Webhook Rows */}
            {webhooks.map(renderWebhookRow)}
          </View>
        </ScrollView>
      )}

      {/* Create Webhook Modal */}
      <CreateWebhookModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Webhook Modal */}
      {selectedWebhook && (
        <EditWebhookModal
          visible={showEditModal}
          webhook={selectedWebhook}
          onClose={() => {
            setShowEditModal(false);
            setSelectedWebhook(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </SafeAreaView>
  );
};

export default WebhooksScreen;
