import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import workItemDetailStyles from '../../styles/WorkManagement/WorkItemDetailScreen.styles';
import { workManagementService, WorkItem } from '../../services/workManagementService';

const styles = workItemDetailStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'WorkItemDetail'>;
type WorkItemDetailRouteProp = RouteProp<RootStackParamList, 'WorkItemDetail'>;

const WorkItemDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<WorkItemDetailRouteProp>();

  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [statusDropdownPosition, setStatusDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [priorityDropdownPosition, setPriorityDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0, width: 0 });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [updatingDate, setUpdatingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [deletingWorkItem, setDeletingWorkItem] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingDescription, setEditingDescription] = useState('');
  const [updatingDescription, setUpdatingDescription] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [subWorkItems, setSubWorkItems] = useState<WorkItem[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [categoryDropdownPosition, setCategoryDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCreateSubItemModal, setShowCreateSubItemModal] = useState(false);
  const [subItemFormData, setSubItemFormData] = useState({
    title: '',
    description: '',
    status: 'Captured',
    assignee: 'Unassigned',
    priority: 'Medium',
    category: 'Select Category',
    dueDate: '',
  });
  const [creatingSubWorkItem, setCreatingSubWorkItem] = useState(false);
  const [showSubItemDatePicker, setShowSubItemDatePicker] = useState(false);
  const [selectedSubItemDate, setSelectedSubItemDate] = useState<string>('');
  const [subItemPickerMonth, setSubItemPickerMonth] = useState(new Date().getMonth());
  const [subItemPickerYear, setSubItemPickerYear] = useState(new Date().getFullYear());
  const [subItemDatePickerPosition, setSubItemDatePickerPosition] = useState({ top: 0, left: 0, width: 0 });
  const subItemDateButtonRef = useRef<any>(null);
  const [showSubItemStatusDropdown, setShowSubItemStatusDropdown] = useState(false);
  const [showSubItemAssigneeDropdown, setShowSubItemAssigneeDropdown] = useState(false);
  const [showSubItemPriorityDropdown, setShowSubItemPriorityDropdown] = useState(false);
  const [showSubItemCategoryDropdown, setShowSubItemCategoryDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagDropdownPosition, setTagDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const tagButtonRef = useRef<any>(null);
  const commentsScrollRef = useRef<any>(null);
  const statusButtonRef = useRef<any>(null);
  const priorityButtonRef = useRef<any>(null);
  const dateButtonRef = useRef<any>(null);
  const categoryButtonRef = useRef<any>(null);

  const { workItemId } = route.params;

  const statuses = ['CAPTURED', 'CLARIFYING', 'THINKING', 'DECIDED', 'IN_PROGRESS', 'IN_REVIEW', 'CLOSED', 'ARCHIVED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    loadWorkItemDetail();
    loadCurrentUserName();
    loadCategories();
  }, [workItemId]);

  useEffect(() => {
    // Auto-scroll to bottom when comments are updated
    if (comments.length > 0 && commentsScrollRef.current) {
      setTimeout(() => {
        commentsScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [comments]);

  const loadCurrentUserName = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      const userData = userProfile ? JSON.parse(userProfile) : null;
      const userName = userData?.name || null;
      setCurrentUserName(userName);
    } catch (err) {
      console.error('Error loading user name:', err);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const fetchedCategories = await workManagementService.getCategories();
      setCategories(fetchedCategories);
      console.log('✅ Categories loaded:', fetchedCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const fetchedTags = await workManagementService.getTags();
      setTags(fetchedTags);
      console.log('✅ Tags loaded:', fetchedTags);
    } catch (err) {
      console.error('Error loading tags:', err);
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleAddTagPress = () => {
    if (tagButtonRef.current) {
      tagButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setTagDropdownPosition({
          top: y + height + 8,
          left: x,
          width: width
        });
        loadTags();
        setShowTagDropdown(true);
      });
    }
  };

  const handleSelectTag = (tag: any) => {
    console.log('📌 Selected tag:', tag);
    setShowTagDropdown(false);
  };

  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return commentDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const loadWorkItemDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await workManagementService.getWorkItems();
      const item = items.find(i => i.id === workItemId);
      if (item) {
        setWorkItem(item);
        // Load comments for this work item
        const fetchedComments = await workManagementService.getComments(workItemId);
        setComments(fetchedComments);
        
        // Load sub-work items (items with parentId matching current workItemId)
        console.log(`🔍 Looking for sub-items with parentId: ${workItemId}`);
        console.log(`📋 All items:`, items.map(i => ({ id: i.id, title: i.title, parentId: i.parentId })));
        const subItems = items.filter(i => {
          const match = i.parentId === String(workItemId) || i.parentId === workItemId;
          console.log(`Checking item ${i.id} (${i.title}): parentId=${i.parentId}, match=${match}`);
          return match;
        });
        setSubWorkItems(subItems);
        console.log(`✅ Loaded ${subItems.length} sub-work items`);
      } else {
        setError('Work item not found');
      }
    } catch (err) {
      console.error('Error loading work item detail:', err);
      let errorMessage = 'Failed to load work item';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as any).message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'CAPTURED': '#64748b',
      'ARCHIVED': '#10b981',
      'CLOSED': '#06b6d4',
      'IN_PROGRESS': '#f59e0b',
      'IN_REVIEW': '#8b5cf6',
    };
    return colors[status] || '#64748b';
  };

  const getPriorityColor = (priority: string | null): string => {
    if (!priority) return '#999';
    const colors: { [key: string]: string } = {
      'LOW': '#64748b',
      'MEDIUM': '#f59e0b',
      'HIGH': '#ef4444',
      'URGENT': '#dc2626',
    };
    return colors[priority] || '#999';
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!workItem) return;
    try {
      setUpdatingStatus(true);
      await workManagementService.updateWorkItemStatus(workItem.id, newStatus);
      setWorkItem({ ...workItem, statusGroup: newStatus as any });
      setShowStatusDropdown(false);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusDropdownPress = () => {
    if (statusButtonRef.current) {
      statusButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setStatusDropdownPosition({
          top: y + height + 8,
          left: x,
          width: width
        });
        setShowStatusDropdown(true);
      });
    }
  };

  const handlePriorityDropdownPress = () => {
    if (priorityButtonRef.current) {
      priorityButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setPriorityDropdownPosition({
          top: y + height + 8,
          left: x,
          width: width
        });
        setShowPriorityDropdown(true);
      });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!workItem) return;
    try {
      setUpdatingPriority(true);
      await workManagementService.updateWorkItemPriority(workItem.id, newPriority);
      setWorkItem({ ...workItem, priority: newPriority as any });
      setShowPriorityDropdown(false);
    } catch (err) {
      console.error('Error updating priority:', err);
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleDatePickerPress = () => {
    if (dateButtonRef.current) {
      dateButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setDatePickerPosition({
          top: y + height + 8,
          left: x,
          width: width
        });
        setShowDatePicker(true);
      });
    }
  };

  const handleDateChange = async (newDate: string) => {
    if (!workItem) return;
    try {
      setUpdatingDate(true);
      // Convert dd/mm/yyyy to yyyy-mm-dd format for API
      const [day, month, year] = newDate.split('/');
      const apiDateFormat = `${year}-${month}-${day}`;
      console.log(`📅 Sending date to API:`, apiDateFormat);
      await workManagementService.updateWorkItemDueDate(workItem.id, apiDateFormat);
      // Store in ISO format for display
      const isoDateFormat = `${year}-${month}-${day}T00:00:00.000Z`;
      setWorkItem({ ...workItem, dueDate: isoDateFormat });
      setShowDatePicker(false);
    } catch (err) {
      console.error('Error updating due date:', err);
    } finally {
      setUpdatingDate(false);
    }
  };

  const handleDescriptionChange = async (newDescription: string) => {
    setEditingDescription(newDescription);
    
    if (!workItem || !newDescription.trim()) return;
    
    try {
      setUpdatingDescription(true);
      const updatedItem = await workManagementService.updateWorkItemFullData(workItem.id, {
        description: newDescription,
      });
      setWorkItem(updatedItem);
      setIsEditingDescription(false);
    } catch (err) {
      console.error('Error updating description:', err);
      Alert.alert('Error', 'Failed to update description');
      setEditingDescription(workItem.description);
    } finally {
      setUpdatingDescription(false);
    }
  };

  const handleDeleteWorkItem = async () => {
    if (!workItem) return;
    
    Alert.alert(
      'Delete Work Item',
      `Are you sure you want to delete "${workItem.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setDeletingWorkItem(true);
              await workManagementService.deleteWorkItem(workItem.id);
              Alert.alert('Success', 'Work item deleted successfully');
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting work item:', err);
              Alert.alert('Error', 'Failed to delete work item');
            } finally {
              setDeletingWorkItem(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleSubItemDatePickerPress = () => {
    if (subItemDateButtonRef.current) {
      subItemDateButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setSubItemDatePickerPosition({
          top: y - 360,
          left: x,
          width: width
        });
        setShowSubItemDatePicker(true);
      });
    }
  };

  const handleSubItemDateChange = (newDate: string) => {
    setSelectedSubItemDate(newDate);
    setSubItemFormData({ ...subItemFormData, dueDate: newDate });
    setShowSubItemDatePicker(false);
  };

  const handleCreateSubWorkItem = async () => {
    if (!subItemFormData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!workItem) return;

    try {
      setCreatingSubWorkItem(true);

      const selectedCategory = categories.find(cat => cat.name === subItemFormData.category);
      const categoryId = selectedCategory ? String(selectedCategory.id) : null;

      const priorityMap: { [key: string]: string } = {
        'Low': 'LOW',
        'Medium': 'MEDIUM',
        'High': 'HIGH',
        'Urgent': 'URGENT',
      };

      let apiDueDate = undefined;
      if (subItemFormData.dueDate) {
        const [day, month, year] = subItemFormData.dueDate.split('/');
        apiDueDate = `${year}-${month}-${day}`;
      }

      const newSubWorkItem = await workManagementService.createWorkItem({
        title: subItemFormData.title,
        description: subItemFormData.description,
        categoryId: categoryId || undefined,
        statusGroup: 'CAPTURED',
        priority: priorityMap[subItemFormData.priority] || 'MEDIUM',
        dueDate: apiDueDate,
        parentId: String(workItem.id),
      });

      console.log('✅ Sub work item created:', newSubWorkItem);

      setSubItemFormData({
        title: '',
        description: '',
        status: 'Captured',
        assignee: 'Unassigned',
        priority: 'Medium',
        category: 'Select Category',
        dueDate: '',
      });
      setSelectedSubItemDate('');
      setShowCreateSubItemModal(false);

      Alert.alert('Success', 'Sub work item created successfully!');
      loadWorkItemDetail();
    } catch (err) {
      console.error('Error creating sub work item:', err);
      Alert.alert('Error', 'Failed to create sub work item. Please try again.');
    } finally {
      setCreatingSubWorkItem(false);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!workItem || !text.trim()) return;
    
    try {
      setLoadingComments(true);
      await workManagementService.addComment(workItem.id, text);
      // Reload all comments after adding
      const updatedComments = await workManagementService.getComments(workItem.id);
      setComments(updatedComments);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleEditComment = (commentId: number, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentContent);
  };

  const handleSaveEditComment = async (commentId: number) => {
    if (!editingCommentText.trim()) return;
    
    try {
      setLoadingComments(true);
      await workManagementService.editComment(commentId, editingCommentText);
      // Reload all comments after editing
      const updatedComments = await workManagementService.getComments(workItem!.id);
      setComments(updatedComments);
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (err) {
      console.error('Error editing comment:', err);
      Alert.alert('Error', 'Failed to edit comment');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            setLoadingComments(true);
            await workManagementService.deleteComment(commentId);
            // Reload all comments after deleting
            const updatedComments = await workManagementService.getComments(workItem!.id);
            setComments(updatedComments);
          } catch (err) {
            console.error('Error deleting comment:', err);
            Alert.alert('Error', 'Failed to delete comment');
          } finally {
            setLoadingComments(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleCategoryDropdownPress = () => {
    console.log('Category button pressed');
    if (categoryButtonRef.current) {
      categoryButtonRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        console.log('Category button position:', { x, y, width, height, pageX, pageY });
        setCategoryDropdownPosition({
          top: pageY + height + 4,
          left: pageX,
          width: width,
        });
        setCategoryDropdownVisible(true);
        console.log('Category dropdown should now be visible');
      });
    } else {
      console.log('categoryButtonRef is not available');
      // Fallback: just open the dropdown
      setCategoryDropdownVisible(true);
    }
  };

  const handleCategoryChange = async (categoryId: number) => {
    if (!workItem) return;
    
    try {
      setUpdatingCategory(true);
      setCategoryDropdownVisible(false);
      const updatedItem = await workManagementService.updateWorkItemFullData(workItem.id, {
        categoryId: String(categoryId),
        statusId: null,
        statusGroup: workItem.statusGroup,
      });
      setWorkItem(updatedItem);
    } catch (err) {
      console.error('Error updating category:', err);
      Alert.alert('Error', 'Failed to update category');
    } finally {
      setUpdatingCategory(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Work Item Detail</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading work item...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workItem) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Work Item Detail</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error || 'Work item not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWorkItemDetail}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(workItem.statusGroup);
  const priorityColor = getPriorityColor(workItem.priority);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Work Item Detail</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.focusModeSection}>
          <View style={styles.focusModeHeader}>
            <View style={styles.focusModeBadge}>
              <MaterialCommunityIcons name="focus-field" size={16} color="#6366f1" />
              <Text style={styles.focusModeBadgeText}>FOCUS MODE</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteWorkItem}
              disabled={deletingWorkItem}
            >
              <MaterialCommunityIcons 
                name="trash-can-outline" 
                size={20} 
                color={deletingWorkItem ? '#ccc' : '#ef4444'} 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.workItemTitle}>
            {workItem.title} #{workItem.id}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="text-box-outline" size={16} color="#666" />
            <Text style={styles.sectionTitle}>CONTEXT & DESCRIPTION</Text>
          </View>
          <View style={styles.descriptionBox}>
            <TextInput
              style={[styles.descriptionText, styles.descriptionInput]}
              value={editingDescription || workItem.description || ''}
              onChangeText={handleDescriptionChange}
              onFocus={() => {
                setIsEditingDescription(true);
                if (!editingDescription) {
                  setEditingDescription(workItem.description || '');
                }
              }}
              placeholder="Click to edit description"
              placeholderTextColor="#999"
              multiline
              editable={!updatingDescription}
            />
          </View>
        </View>

        <View style={styles.metadataSection}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>ASSIGNEE</Text>
              <View style={styles.assigneeContainer}>
                {workItem.assignee?.name ? (
                  <View style={[styles.assigneeAvatar, { backgroundColor: statusColor }]}>
                    <Text style={styles.assigneeInitial}>
                      {workItem.assignee.name
                        .split(' ')
                        .map(word => word.charAt(0))
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.assigneeAvatar, { backgroundColor: '#ddd' }]}>
                    <MaterialCommunityIcons name="account-plus-outline" size={16} color="#999" />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>STATUS</Text>
              <TouchableOpacity
                ref={statusButtonRef}
                style={[styles.statusDropdown, { borderColor: statusColor }]}
                onPress={handleStatusDropdownPress}
                disabled={updatingStatus}
              >
                <Text style={[styles.statusDropdownText, { color: statusColor }]}>
                  {workItem.statusGroup}
                </Text>
                <MaterialCommunityIcons 
                  name={showStatusDropdown ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={statusColor} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>PRIORITY</Text>
              <TouchableOpacity
                ref={priorityButtonRef}
                style={[styles.priorityDropdown, { borderColor: priorityColor }]}
                onPress={handlePriorityDropdownPress}
                disabled={updatingPriority}
              >
                <Text style={[styles.priorityDropdownText, { color: priorityColor }]}>
                  {workItem.priority || 'None'}
                </Text>
                <MaterialCommunityIcons 
                  name={showPriorityDropdown ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={priorityColor} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>CATEGORY</Text>
              <TouchableOpacity
                ref={categoryButtonRef}
                style={[styles.categoryDropdown, updatingCategory && { opacity: 0.6 }]}
                onPress={handleCategoryDropdownPress}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryDropdownText}>
                  {typeof workItem.category === 'object' && workItem.category?.name ? workItem.category.name : 'Select Category'}
                </Text>
                <MaterialCommunityIcons 
                  name={categoryDropdownVisible ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>DUE DATE</Text>
              <TouchableOpacity
                ref={dateButtonRef}
                style={styles.dueDateDropdown}
                onPress={handleDatePickerPress}
                disabled={updatingDate}
              >
                <Text style={styles.dueDateDropdownText}>
                  {workItem.dueDate ? String(workManagementService.formatDate(workItem.dueDate)) : 'dd/mm/yyyy'}
                </Text>
                <MaterialCommunityIcons name="calendar" size={16} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tagsHeader}>
            <MaterialCommunityIcons name="tag-multiple" size={16} color="#666" />
            <Text style={styles.sectionTitle}>TAGS</Text>
          </View>
          <TouchableOpacity 
            ref={tagButtonRef}
            style={styles.addTagButton} 
            onPress={handleAddTagPress}
          >
            <MaterialCommunityIcons name="plus" size={14} color="#6366f1" />
            <Text style={styles.addTagButtonText}>ADD TAG</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.subWorkItemsHeader}>
            <MaterialCommunityIcons name="format-list-numbered" size={16} color="#666" />
            <Text style={styles.sectionTitle}>SUB WORK ITEMS {subWorkItems.length > 0 ? subWorkItems.length : ''}</Text>
          </View>
          
          {subWorkItems.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              {subWorkItems.map((subItem) => (
                <TouchableOpacity 
                  key={subItem.id}
                  style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                  onPress={() => navigation.push('WorkItemDetail', { workItemId: subItem.id })}
                >
                  <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '500' }}>
                    {subItem.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addSubItemButton}
            onPress={() => setShowCreateSubItemModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={14} color="#fff" />
            <Text style={styles.addSubItemButtonText}>Add Sub Work Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.commentsHeader}>
            <MaterialCommunityIcons name="comment-multiple-outline" size={16} color="#666" />
            <Text style={styles.sectionTitle}>COMMENTS {Array.isArray(comments) && comments.length > 0 ? comments.length : ''}</Text>
          </View>
          
          {!comments || comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet</Text>
          ) : (
            <>
              {comments.length > 3 && !showAllComments && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => setShowAllComments(true)}
                >
                  <Text style={styles.showMoreText}>Show more comments ({comments.length - 3})</Text>
                </TouchableOpacity>
              )}
              <ScrollView ref={commentsScrollRef} style={styles.commentsList} showsVerticalScrollIndicator={false}>
                {Array.isArray(comments) && (showAllComments ? comments : comments.slice(-3)).map((comment: any) => (
                <TouchableOpacity 
                  key={comment.id} 
                  style={styles.commentItem}
                  onPress={() => setSelectedCommentId(selectedCommentId === comment.id ? null : comment.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentAuthor}>
                          {currentUserName || `User ${comment.userId}`}
                        </Text>
                        <Text style={styles.commentTime}>
                          {getRelativeTime(comment.createdAt)}
                        </Text>
                        {comment.isEdited && (
                          <Text style={styles.editedLabel}>(edited)</Text>
                        )}
                      </View>
                      {selectedCommentId === comment.id && (
                        <View style={styles.commentActions}>
                          <TouchableOpacity 
                            onPress={() => handleEditComment(comment.id, comment.content)}
                            disabled={loadingComments}
                          >
                            <MaterialCommunityIcons name="pencil" size={16} color="#999" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleDeleteComment(comment.id)}
                            disabled={loadingComments}
                            style={{ marginLeft: 12 }}
                          >
                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#999" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    
                    {editingCommentId === comment.id ? (
                      <View style={styles.editCommentContainer}>
                        <TextInput
                          style={styles.editCommentInput}
                          value={editingCommentText}
                          onChangeText={setEditingCommentText}
                          multiline
                          editable={!loadingComments}
                        />
                        <View style={styles.editCommentActions}>
                          <TouchableOpacity 
                            onPress={() => {
                              setEditingCommentId(null);
                              setEditingCommentText('');
                            }}
                            disabled={loadingComments}
                          >
                            <MaterialCommunityIcons name="close" size={16} color="#999" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleSaveEditComment(comment.id)}
                            disabled={loadingComments || !editingCommentText.trim()}
                            style={{ marginLeft: 12 }}
                          >
                            <MaterialCommunityIcons name="check" size={16} color="#6366f1" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.commentText}>{comment.content}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              </ScrollView>
            </>
          )}
          
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#999"
              value={commentText}
              onChangeText={(text) => {
                setCommentText(text);
                if (text.trim() && text.endsWith('\n')) {
                  handleAddComment(text.trim());
                }
              }}
              multiline
              editable={!loadingComments}
            />
            <TouchableOpacity 
              style={[styles.sendButton, loadingComments && styles.sendButtonDisabled]}
              onPress={() => handleAddComment(commentText)}
              disabled={!commentText.trim() || loadingComments}
            >
              <MaterialCommunityIcons 
                name="send" 
                size={16} 
                color={commentText.trim() && !loadingComments ? '#6366f1' : '#ccc'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.createdDateSection}>
          <MaterialCommunityIcons name="calendar" size={16} color="#999" />
          <Text style={styles.createdDateText}>
            CREATED DATE - {String(workManagementService.formatDate(workItem.createdAt))}
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent
        animationType="none"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={[styles.dropdownModalContent, { top: statusDropdownPosition.top, left: statusDropdownPosition.left, width: statusDropdownPosition.width }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 250 }}>
              {statuses.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    workItem?.statusGroup === status && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleStatusChange(status)}
                  disabled={updatingStatus}
                >
                  {workItem?.statusGroup === status && (
                    <MaterialCommunityIcons name="check" size={14} color="#6366f1" style={{ marginRight: 8 }} />
                  )}
                  <Text style={[
                    styles.dropdownItemText,
                    workItem?.statusGroup === status && styles.dropdownItemTextSelected
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Priority Dropdown Modal */}
      <Modal
        visible={showPriorityDropdown}
        transparent
        animationType="none"
        onRequestClose={() => setShowPriorityDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowPriorityDropdown(false)}
        >
          <View style={[styles.dropdownModalContent, { top: priorityDropdownPosition.top, left: priorityDropdownPosition.left, width: priorityDropdownPosition.width }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {priorities.map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.dropdownItem,
                    workItem?.priority === priority && styles.dropdownItemSelected
                  ]}
                  onPress={() => handlePriorityChange(priority)}
                  disabled={updatingPriority}
                >
                  {workItem?.priority === priority && (
                    <MaterialCommunityIcons name="check" size={14} color="#6366f1" style={{ marginRight: 8 }} />
                  )}
                  <Text style={[
                    styles.dropdownItemText,
                    workItem?.priority === priority && styles.dropdownItemTextSelected
                  ]}>
                    {priority}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Category Dropdown Modal */}
      <Modal
        visible={categoryDropdownVisible}
        transparent
        animationType="none"
        onRequestClose={() => setCategoryDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setCategoryDropdownVisible(false)}
        >
          <View style={[styles.dropdownModalContent, { top: categoryDropdownPosition.top, left: categoryDropdownPosition.left, width: categoryDropdownPosition.width }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.dropdownItem,
                    typeof workItem?.category === 'object' && workItem?.category?.id === category.id && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                  disabled={updatingCategory}
                >
                  {typeof workItem?.category === 'object' && workItem?.category?.id === category.id && (
                    <MaterialCommunityIcons name="check" size={14} color="#6366f1" style={{ marginRight: 8 }} />
                  )}
                  <Text style={[
                    styles.dropdownItemText,
                    typeof workItem?.category === 'object' && workItem?.category?.id === category.id && styles.dropdownItemTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={[styles.datePickerContainer, { top: datePickerPosition.top, left: datePickerPosition.left, width: datePickerPosition.width }]}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerMonth}>
                {new Date(pickerYear, pickerMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.datePickerNav}>
                <TouchableOpacity onPress={() => {
                  if (pickerMonth === 0) {
                    setPickerMonth(11);
                    setPickerYear(pickerYear - 1);
                  } else {
                    setPickerMonth(pickerMonth - 1);
                  }
                }}>
                  <MaterialCommunityIcons name="chevron-up" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  if (pickerMonth === 11) {
                    setPickerMonth(0);
                    setPickerYear(pickerYear + 1);
                  } else {
                    setPickerMonth(pickerMonth + 1);
                  }
                }}>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.datePickerGrid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.datePickerDayHeader}>{day}</Text>
              ))}
              {Array.from({ length: 35 }).map((_, idx) => {
                const firstDay = new Date(pickerYear, pickerMonth, 1).getDay();
                const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
                const dayNum = idx - firstDay + 1;
                const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.datePickerDay,
                      isCurrentMonth && selectedDate && parseInt(selectedDate.split('/')[0]) === dayNum && styles.datePickerDaySelected
                    ]}
                    onPress={() => {
                      if (isCurrentMonth) {
                        const day = String(dayNum).padStart(2, '0');
                        const month = String(pickerMonth + 1).padStart(2, '0');
                        const year = pickerYear;
                        const newDate = `${day}/${month}/${year}`;
                        setSelectedDate(newDate);
                        // Auto-update immediately
                        handleDateChange(newDate);
                      }
                    }}
                    disabled={!isCurrentMonth}
                  >
                    <Text style={[
                      styles.datePickerDayText,
                      !isCurrentMonth && { color: '#ddd' },
                      isCurrentMonth && selectedDate && parseInt(selectedDate.split('/')[0]) === dayNum && styles.datePickerDayTextSelected
                    ]}>
                      {isCurrentMonth ? dayNum : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.datePickerFooter}>
              <TouchableOpacity onPress={() => setSelectedDate('')}>
                <Text style={styles.datePickerFooterText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (selectedDate) {
                  handleDateChange(selectedDate);
                  setSelectedDate('');
                }
              }}>
                <Text style={styles.datePickerFooterText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create Sub Work Item Modal */}
      <Modal
        visible={showCreateSubItemModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateSubItemModal(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-start', paddingTop: 10 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1}
            onPress={() => {}}
          />
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '90%', paddingBottom: 20, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e5e5' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#999', letterSpacing: 0.5 }}>CREATE SUB WORK ITEM</Text>
              <TouchableOpacity onPress={() => setShowCreateSubItemModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>TITLE</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a' }}
                  placeholder="What needs to be done?"
                  placeholderTextColor="#999"
                  value={subItemFormData.title}
                  onChangeText={(text) => setSubItemFormData({ ...subItemFormData, title: text })}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={14} color="#999" />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }}>DESCRIPTION</Text>
                </View>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', minHeight: 100 }}
                  placeholder="Add more context to this item..."
                  placeholderTextColor="#999"
                  value={subItemFormData.description}
                  onChangeText={(text) => setSubItemFormData({ ...subItemFormData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="circle" size={14} color="#999" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }}>STATUS</Text>
                  </View>
                  <TouchableOpacity
                    style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => setShowSubItemStatusDropdown(!showSubItemStatusDropdown)}
                  >
                    <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{subItemFormData.status}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showSubItemStatusDropdown && (
                    <View style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, marginTop: 4, backgroundColor: '#fff' }}>
                      {statuses.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                          onPress={() => {
                            setSubItemFormData({ ...subItemFormData, status: option });
                            setShowSubItemStatusDropdown(false);
                          }}
                        >
                          <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="account" size={14} color="#999" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }}>ASSIGNEE</Text>
                  </View>
                  <TouchableOpacity
                    style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => setShowSubItemAssigneeDropdown(!showSubItemAssigneeDropdown)}
                  >
                    <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{subItemFormData.assignee}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showSubItemAssigneeDropdown && (
                    <View style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, marginTop: 4, backgroundColor: '#fff' }}>
                      {['Unassigned', 'Assigned'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                          onPress={() => {
                            setSubItemFormData({ ...subItemFormData, assignee: option });
                            setShowSubItemAssigneeDropdown(false);
                          }}
                        >
                          <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="flag" size={14} color="#999" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }}>PRIORITY</Text>
                  </View>
                  <TouchableOpacity
                    style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => setShowSubItemPriorityDropdown(!showSubItemPriorityDropdown)}
                  >
                    <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{subItemFormData.priority}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showSubItemPriorityDropdown && (
                    <View style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, marginTop: 4, backgroundColor: '#fff' }}>
                      {['Low', 'Medium', 'High', 'Urgent'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                          onPress={() => {
                            setSubItemFormData({ ...subItemFormData, priority: option });
                            setShowSubItemPriorityDropdown(false);
                          }}
                        >
                          <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <MaterialCommunityIcons name="tag" size={14} color="#999" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }}>CATEGORY</Text>
                  </View>
                  <TouchableOpacity
                    style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    onPress={() => setShowSubItemCategoryDropdown(!showSubItemCategoryDropdown)}
                  >
                    <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{subItemFormData.category}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showSubItemCategoryDropdown && (
                    <View style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, marginTop: 4, backgroundColor: '#fff' }}>
                      {['Select Category', ...categories.map(cat => cat.name)].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                          onPress={() => {
                            setSubItemFormData({ ...subItemFormData, category: option });
                            setShowSubItemCategoryDropdown(false);
                          }}
                        >
                          <Text style={{ fontSize: 14, color: '#1a1a1a' }}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#999" />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }}>DUE DATE (OPTIONAL)</Text>
                </View>
                <TouchableOpacity
                  ref={subItemDateButtonRef}
                  style={{ borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                  onPress={handleSubItemDatePickerPress}
                >
                  <Text style={{ fontSize: 14, color: subItemFormData.dueDate ? '#1a1a1a' : '#999' }}>
                    {subItemFormData.dueDate || 'dd/mm/yyyy'}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e5e5' }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 6, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' }}
                onPress={() => setShowCreateSubItemModal(false)}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#666' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 6, backgroundColor: '#c7d2fe', alignItems: 'center', opacity: creatingSubWorkItem ? 0.6 : 1 }}
                onPress={handleCreateSubWorkItem}
                disabled={creatingSubWorkItem}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#6366f1' }}>
                  {creatingSubWorkItem ? 'CREATING...' : 'CREATE ITEM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sub Work Item Date Picker Modal */}
      <Modal
        visible={showSubItemDatePicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowSubItemDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubItemDatePicker(false)}
        >
          <View style={[styles.datePickerContainer, { top: subItemDatePickerPosition.top, left: subItemDatePickerPosition.left, width: subItemDatePickerPosition.width }]}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerMonth}>
                {new Date(subItemPickerYear, subItemPickerMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <View style={styles.datePickerNav}>
                <TouchableOpacity onPress={() => {
                  if (subItemPickerMonth === 0) {
                    setSubItemPickerMonth(11);
                    setSubItemPickerYear(subItemPickerYear - 1);
                  } else {
                    setSubItemPickerMonth(subItemPickerMonth - 1);
                  }
                }}>
                  <MaterialCommunityIcons name="chevron-up" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  if (subItemPickerMonth === 11) {
                    setSubItemPickerMonth(0);
                    setSubItemPickerYear(subItemPickerYear + 1);
                  } else {
                    setSubItemPickerMonth(subItemPickerMonth + 1);
                  }
                }}>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.datePickerGrid}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <Text key={idx} style={styles.datePickerDayHeader}>{day}</Text>
              ))}
              {Array.from({ length: 35 }).map((_, idx) => {
                const firstDay = new Date(subItemPickerYear, subItemPickerMonth, 1).getDay();
                const daysInMonth = new Date(subItemPickerYear, subItemPickerMonth + 1, 0).getDate();
                const dayNum = idx - firstDay + 1;
                const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.datePickerDay,
                      isCurrentMonth && selectedSubItemDate && parseInt(selectedSubItemDate.split('/')[0]) === dayNum && styles.datePickerDaySelected
                    ]}
                    onPress={() => {
                      if (isCurrentMonth) {
                        const day = String(dayNum).padStart(2, '0');
                        const month = String(subItemPickerMonth + 1).padStart(2, '0');
                        const year = subItemPickerYear;
                        const newDate = `${day}/${month}/${year}`;
                        handleSubItemDateChange(newDate);
                      }
                    }}
                    disabled={!isCurrentMonth}
                  >
                    <Text style={[
                      styles.datePickerDayText,
                      !isCurrentMonth && { color: '#ddd' },
                      isCurrentMonth && selectedSubItemDate && parseInt(selectedSubItemDate.split('/')[0]) === dayNum && styles.datePickerDayTextSelected
                    ]}>
                      {isCurrentMonth ? dayNum : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tag Dropdown Modal */}
      <Modal
        visible={showTagDropdown}
        transparent
        animationType="none"
        onRequestClose={() => setShowTagDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowTagDropdown(false)}
        >
          <View style={[styles.dropdownModalContent, { top: tagDropdownPosition.top, left: tagDropdownPosition.left, width: tagDropdownPosition.width }]}>
            {loadingTags ? (
              <View style={styles.dropdownLoadingContainer}>
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectTag(tag)}
                >
                  <View
                    style={[
                      styles.tagColorDot,
                      { backgroundColor: tag.color || '#6366f1' }
                    ]}
                  />
                  <Text style={styles.dropdownItemText}>{tag.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.dropdownEmptyItem}>
                <Text style={styles.dropdownEmptyText}>No tags</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export default WorkItemDetailScreen;
