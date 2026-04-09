import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
import manageViewsStyles from '../../styles/WorkManagement/ManageViewsScreen.styles';
import { workManagementService, View as ViewType } from '../../services/workManagementService';

const styles = manageViewsStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ManageViews'>;
type ManageViewsRouteProp = RouteProp<RootStackParamList, 'ManageViews'>;

const ManageViewsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ManageViewsRouteProp>();

  const organizationName = route.params?.organizationName || 'Workspace';

  const [views, setViews] = useState<ViewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');
  const [viewCommand, setViewCommand] = useState('');
  const [creatingView, setCreatingView] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editViewName, setEditViewName] = useState('');
  const [editViewDescription, setEditViewDescription] = useState('');
  const [updatingView, setUpdatingView] = useState(false);

  useEffect(() => {
    loadViews();
  }, []);

  useEffect(() => {
    if (route.params?.openAddModal) {
      setShowCreateModal(true);
    }
  }, [route.params?.openAddModal]);

  const loadViews = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedViews = await workManagementService.getViews();
      setViews(fetchedViews);
      console.log('✅ Views loaded:', fetchedViews);
    } catch (err) {
      console.error('Error loading views:', err);
      setError(err instanceof Error ? err.message : 'Failed to load views');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateView = async () => {
    const name = viewName.trim();
    const command = viewCommand.trim();
    
    if (!name) {
      Alert.alert('Error', 'Please enter a view name');
      return;
    }
    
    if (!command) {
      Alert.alert('Error', 'Please enter a natural language query');
      return;
    }

    try {
      setCreatingView(true);
      const newView = await workManagementService.createView({
        name: name,
        description: viewDescription.trim(),
        command: command,
      });

      console.log('✅ View created:', newView);
      setViews([...views, newView]);
      setShowCreateModal(false);
      setViewName('');
      setViewDescription('');
      setViewCommand('');
      Alert.alert('Success', 'View created successfully!');
    } catch (err) {
      console.error('Error creating view:', err);
      Alert.alert('Error', 'Failed to create view. Please try again.');
    } finally {
      setCreatingView(false);
    }
  };

  const handleDeleteView = async () => {
    if (!selectedView) return;

    try {
      console.log(`🗑️ Deleting view ${selectedView.id}...`);
      await workManagementService.deleteView(selectedView.id);
      
      console.log('✅ View deleted from API');
      setViews(views.filter(view => view.id !== selectedView.id));
      setShowDeleteConfirm(false);
      setSelectedView(null);
      Alert.alert('Success', 'View deleted successfully!');
    } catch (err) {
      console.error('Error deleting view:', err);
      Alert.alert('Error', 'Failed to delete view. Please try again.');
    }
  };

  const handleEditViewOpen = (view: ViewType) => {
    setSelectedView(view);
    setEditViewName(view.name);
    setEditViewDescription(view.description || '');
    setShowEditModal(true);
  };

  const handleUpdateView = async () => {
    const name = editViewName.trim();
    
    if (!name) {
      Alert.alert('Error', 'Please enter a view name');
      return;
    }

    if (!selectedView) return;

    try {
      setUpdatingView(true);
      const updatedView = await workManagementService.updateView(selectedView.id, {
        name: name,
        description: editViewDescription.trim(),
      });

      console.log('✅ View updated:', updatedView);
      setViews(views.map(view => view.id === selectedView.id ? updatedView : view));
      setShowEditModal(false);
      setSelectedView(null);
      setEditViewName('');
      setEditViewDescription('');
      Alert.alert('Success', 'View updated successfully!');
    } catch (err) {
      console.error('Error updating view:', err);
      Alert.alert('Error', 'Failed to update view. Please try again.');
    } finally {
      setUpdatingView(false);
    }
  };

  const renderView = ({ item }: { item: ViewType }) => (
    <View style={styles.viewCard}>
      <View style={styles.viewHeader}>
        <View style={styles.viewInfo}>
          <View style={[styles.viewIcon, { backgroundColor: '#06b6d4' + '20' }]}>
            <MaterialCommunityIcons name="eye" size={20} color="#06b6d4" />
          </View>
          <View style={styles.viewDetails}>
            <Text style={styles.viewName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.viewDescription}>{item.description}</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.viewFooter}>
        <View style={styles.viewBadge}>
          <Text style={styles.viewBadgeText}>AI GENERATED VIEW</Text>
        </View>
        <View style={styles.viewActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEditViewOpen(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => {
              setSelectedView(item);
              setShowDeleteConfirm(true);
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading views...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              console.log('🔙 Back button pressed (error state)');
              navigation.goBack();
            }}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Custom Views</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadViews}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('🔙 Back button pressed');
            navigation.goBack();
          }}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons name="eye" size={24} color="#06b6d4" />
            <Text style={styles.headerTitle}>Custom Views</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Manage your AI-powered views to keep track of work items that matter most to you.
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Create View</Text>
        </TouchableOpacity>
      </View>

      {views.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="eye-off-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No views yet</Text>
          <Text style={styles.emptySubText}>Create your first view to get started</Text>
        </View>
      ) : (
        <FlatList
          data={views}
          renderItem={renderView}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons name="sparkles" size={24} color="#6366f1" />
                <Text style={styles.modalTitle}>Create AI View</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(false)}
                disabled={creatingView}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>View Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. My Urgent Bugs"
                  placeholderTextColor="#999"
                  value={viewName}
                  onChangeText={setViewName}
                  editable={!creatingView}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Describe what this view is for..."
                  placeholderTextColor="#999"
                  value={viewDescription}
                  onChangeText={setViewDescription}
                  multiline
                  editable={!creatingView}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.queryLabelContainer}>
                  <Text style={styles.formLabel}>Natural Language Query</Text>
                  <MaterialCommunityIcons name="sparkles" size={14} color="#6366f1" />
                </View>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput, styles.queryInput]}
                  placeholder="e.g. show me all high priority items that were created in the last 7 days"
                  placeholderTextColor="#999"
                  value={viewCommand}
                  onChangeText={setViewCommand}
                  multiline
                  editable={!creatingView}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
                disabled={creatingView}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, creatingView && { opacity: 0.6 }]}
                onPress={handleCreateView}
                disabled={creatingView}
              >
                {creatingView ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.createButtonText}>Generate & Create</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <MaterialCommunityIcons name="pencil" size={24} color="#6366f1" />
                <Text style={styles.modalTitle}>Edit View</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                disabled={updatingView}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>View Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. My Urgent Bugs"
                  placeholderTextColor="#999"
                  value={editViewName}
                  onChangeText={setEditViewName}
                  editable={!updatingView}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Describe what this view is for..."
                  placeholderTextColor="#999"
                  value={editViewDescription}
                  onChangeText={setEditViewDescription}
                  multiline
                  editable={!updatingView}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.queryLabelContainer}>
                  <Text style={styles.formLabel}>Natural Language Query</Text>
                  <MaterialCommunityIcons name="sparkles" size={14} color="#6366f1" />
                </View>
                <View style={[styles.textInput, styles.textAreaInput, styles.queryInputDisabled]}>
                  <Text style={styles.queryDisabledText}>{selectedView?.command || ''}</Text>
                </View>
                <Text style={styles.queryDisabledNote}>Query regeneration is not supported yet during edit.</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
                disabled={updatingView}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, updatingView && { opacity: 0.6 }]}
                onPress={handleUpdateView}
                disabled={updatingView}
              >
                {updatingView ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.confirmTitle}>Delete View?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete "{selectedView?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.confirmCancel}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setSelectedView(null);
                }}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDelete}
                onPress={handleDeleteView}
              >
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageViewsScreen;
