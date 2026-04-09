import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import manageTagsStyles from '../../styles/WorkManagement/ManageTagsScreen.styles';
import { workManagementService, Tag } from '../../services/workManagementService';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ManageTags'>;
type ManageTagsRouteProp = RouteProp<RootStackParamList, 'ManageTags'>;

const ManageTagsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ManageTagsRouteProp>();

  const organizationName = route.params?.organizationName || 'Workspace';

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [creatingTag, setCreatingTag] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('#3b82f6');
  const [updatingTag, setUpdatingTag] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1',
    '#14b8a6', '#f97316', '#6b7280', '#a855f7',
  ];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTags = await workManagementService.getTags();
      setTags(fetchedTags);
      console.log('✅ Tags loaded:', fetchedTags);
    } catch (err) {
      console.error('Error loading tags:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    const name = tagName.trim();
    
    if (!name) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      setCreatingTag(true);
      const newTag = await workManagementService.createTag({
        name: name,
        color: tagColor,
      });

      console.log('✅ Tag created:', newTag);
      setTags([...tags, newTag]);
      setShowCreateModal(false);
      setTagName('');
      setTagColor('#3b82f6');
      Alert.alert('Success', 'Tag created successfully!');
    } catch (err) {
      console.error('Error creating tag:', err);
      Alert.alert('Error', 'Failed to create tag. Please try again.');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleEditTagOpen = (tag: Tag) => {
    setSelectedTag(tag);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
    setShowEditModal(true);
  };

  const handleUpdateTag = async () => {
    const name = editTagName.trim();
    
    if (!name) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    if (!selectedTag) return;

    try {
      setUpdatingTag(true);
      const updatedTag = await workManagementService.updateTag(selectedTag.id, {
        name: name,
        color: editTagColor,
      });

      console.log('✅ Tag updated:', updatedTag);
      setTags(tags.map(tag => tag.id === selectedTag.id ? updatedTag : tag));
      setShowEditModal(false);
      setSelectedTag(null);
      setEditTagName('');
      setEditTagColor('#3b82f6');
      Alert.alert('Success', 'Tag updated successfully!');
    } catch (err) {
      console.error('Error updating tag:', err);
      Alert.alert('Error', 'Failed to update tag. Please try again.');
    } finally {
      setUpdatingTag(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      console.log(`🗑️ Deleting tag ${selectedTag.id}...`);
      await workManagementService.deleteTag(selectedTag.id);
      
      console.log('✅ Tag deleted from API');
      setTags(tags.filter(tag => tag.id !== selectedTag.id));
      setShowDeleteConfirm(false);
      setSelectedTag(null);
      Alert.alert('Success', 'Tag deleted successfully!');
    } catch (err) {
      console.error('Error deleting tag:', err);
      Alert.alert('Error', 'Failed to delete tag. Please try again.');
    }
  };

  const renderTag = ({ item }: { item: Tag }) => (
    <View style={manageTagsStyles.tagCard}>
      <View style={manageTagsStyles.tagContent}>
        <View style={[manageTagsStyles.tagColorDot, { backgroundColor: item.color }]} />
        <View style={manageTagsStyles.tagInfo}>
          <Text style={manageTagsStyles.tagName}>{item.name}</Text>
          <Text style={manageTagsStyles.tagColor}>{item.color}</Text>
        </View>
      </View>
      <View style={manageTagsStyles.tagActions}>
        <TouchableOpacity 
          style={manageTagsStyles.actionButton}
          onPress={() => handleEditTagOpen(item)}
        >
          <MaterialCommunityIcons name="pencil" size={18} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={manageTagsStyles.actionButton}
          onPress={() => {
            setSelectedTag(item);
            setShowDeleteConfirm(true);
          }}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={manageTagsStyles.container}>
        <View style={manageTagsStyles.header}>
          <TouchableOpacity 
            style={manageTagsStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <View style={manageTagsStyles.headerContent}>
            <View style={manageTagsStyles.headerTitleRow}>
              <MaterialCommunityIcons name="tag-multiple" size={24} color="#f59e0b" />
              <Text style={manageTagsStyles.headerTitle}>Manage Tags</Text>
            </View>
          </View>
        </View>
        <View style={manageTagsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={manageTagsStyles.loadingText}>Loading tags...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={manageTagsStyles.container}>
        <View style={manageTagsStyles.header}>
          <TouchableOpacity 
            style={manageTagsStyles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
          </TouchableOpacity>
          <View style={manageTagsStyles.headerContent}>
            <View style={manageTagsStyles.headerTitleRow}>
              <MaterialCommunityIcons name="tag-multiple" size={24} color="#f59e0b" />
              <Text style={manageTagsStyles.headerTitle}>Manage Tags</Text>
            </View>
          </View>
        </View>
        <View style={manageTagsStyles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={manageTagsStyles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={manageTagsStyles.retryButton}
            onPress={loadTags}
          >
            <Text style={manageTagsStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={manageTagsStyles.container}>
      <View style={manageTagsStyles.header}>
        <TouchableOpacity 
          style={manageTagsStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>
        <View style={manageTagsStyles.headerContent}>
          <View style={manageTagsStyles.headerTitleRow}>
            <MaterialCommunityIcons name="tag-multiple" size={24} color="#f59e0b" />
            <Text style={manageTagsStyles.headerTitle}>Manage Tags</Text>
          </View>
          <Text style={manageTagsStyles.headerSubtitle}>
            Tags help you organize and filter work items across all categories.
          </Text>
        </View>
      </View>

      <View style={manageTagsStyles.createSection}>
        <Text style={manageTagsStyles.sectionLabel}>TAG NAME</Text>
        <View style={manageTagsStyles.createRow}>
          <TextInput
            style={manageTagsStyles.tagInput}
            placeholder="Enter tag name..."
            placeholderTextColor="#999"
            value={tagName}
            onChangeText={setTagName}
            editable={!creatingTag}
          />
          <Text style={manageTagsStyles.colorLabel}>COLOR</Text>
          <TouchableOpacity 
            style={[manageTagsStyles.colorPicker, { backgroundColor: tagColor }]}
            onPress={() => {
              const currentIndex = colors.indexOf(tagColor);
              const nextIndex = (currentIndex + 1) % colors.length;
              setTagColor(colors[nextIndex]);
            }}
          />
          <TouchableOpacity 
            style={[manageTagsStyles.addTagButton, creatingTag && { opacity: 0.6 }]}
            onPress={handleCreateTag}
            disabled={creatingTag}
          >
            {creatingTag ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                <Text style={manageTagsStyles.addTagButtonText}>Add Tag</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {tags.length === 0 ? (
        <View style={manageTagsStyles.emptyContainer}>
          <MaterialCommunityIcons name="tag-off-outline" size={48} color="#ccc" />
          <Text style={manageTagsStyles.emptyText}>No tags yet</Text>
          <Text style={manageTagsStyles.emptySubText}>Create your first tag to get started</Text>
        </View>
      ) : (
        <View style={manageTagsStyles.tagsSection}>
          <View style={manageTagsStyles.sectionHeader}>
            <Text style={manageTagsStyles.sectionTitle}>YOUR TAGS</Text>
            <Text style={manageTagsStyles.tagCount}>{tags.length} total</Text>
          </View>
          <FlatList
            data={tags}
            renderItem={renderTag}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={manageTagsStyles.listContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={manageTagsStyles.helpText}>
        <Text style={manageTagsStyles.helpTextContent}>
          Tags help you organize and filter work items across all categories.
        </Text>
      </View>

      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          style={manageTagsStyles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={manageTagsStyles.modalContent}>
            <View style={manageTagsStyles.modalHeader}>
              <Text style={manageTagsStyles.modalTitle}>Edit Tag</Text>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                disabled={updatingTag}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={manageTagsStyles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={manageTagsStyles.formGroup}>
                <Text style={manageTagsStyles.formLabel}>Tag Name</Text>
                <TextInput
                  style={manageTagsStyles.textInput}
                  placeholder="Enter tag name..."
                  placeholderTextColor="#999"
                  value={editTagName}
                  onChangeText={setEditTagName}
                  editable={!updatingTag}
                />
              </View>

              <View style={manageTagsStyles.formGroup}>
                <Text style={manageTagsStyles.formLabel}>Color</Text>
                <View style={manageTagsStyles.colorGrid}>
                  {colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        manageTagsStyles.colorOption,
                        { backgroundColor: color },
                        editTagColor === color && manageTagsStyles.colorOptionSelected,
                      ]}
                      onPress={() => setEditTagColor(color)}
                    >
                      {editTagColor === color && (
                        <MaterialCommunityIcons name="check" size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={manageTagsStyles.modalFooter}>
              <TouchableOpacity 
                style={manageTagsStyles.cancelButton}
                onPress={() => setShowEditModal(false)}
                disabled={updatingTag}
              >
                <Text style={manageTagsStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[manageTagsStyles.saveButton, updatingTag && { opacity: 0.6 }]}
                onPress={handleUpdateTag}
                disabled={updatingTag}
              >
                {updatingTag ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={manageTagsStyles.saveButtonText}>Save Changes</Text>
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
        <View style={manageTagsStyles.confirmOverlay}>
          <View style={manageTagsStyles.confirmDialog}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
            <Text style={manageTagsStyles.confirmTitle}>Delete Tag?</Text>
            <Text style={manageTagsStyles.confirmMessage}>
              Are you sure you want to delete "{selectedTag?.name}"? This action cannot be undone.
            </Text>
            <View style={manageTagsStyles.confirmButtons}>
              <TouchableOpacity 
                style={manageTagsStyles.confirmCancel}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setSelectedTag(null);
                }}
              >
                <Text style={manageTagsStyles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={manageTagsStyles.confirmDelete}
                onPress={handleDeleteTag}
              >
                <Text style={manageTagsStyles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageTagsScreen;
