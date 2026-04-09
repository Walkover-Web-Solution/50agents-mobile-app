import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Alert,
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
import workItemsStyles from '../../styles/WorkManagement/WorkItemsScreen.styles';
import { workManagementService, WorkItem } from '../../services/workManagementService';
import WorkFlowScreen from './WorkFlowScreen';
import { Dimensions } from 'react-native';

const styles = workItemsStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'WorkItems'>;
type WorkItemsRouteProp = RouteProp<RootStackParamList, 'WorkItems'>;

const WorkItemsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<WorkItemsRouteProp>();

  const organizationName = route.params?.organizationName || 'Workspace';

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [creatingWorkItem, setCreatingWorkItem] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0, width: 0 });
  const dateButtonRef = React.useRef<any>(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    status: 'Captured',
    assignee: 'Unassigned',
    priority: 'Medium',
    category: 'Select Category',
    dueDate: '',
  });

  const statusOptions = ['Captured', 'Clarifying', 'Thinking', 'Decided', 'In Progress', 'Closed', 'Archived'];
  const assigneeOptions = ['Unassigned', 'Me', 'Team Member 1', 'Team Member 2'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  const categoryOptions = categories.map(cat => cat.name);

  const statuses = ['CAPTURED', 'CLARIFYING', 'THINKING', 'DECIDED', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    loadWorkItems();
    loadCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workItems, selectedStatuses, selectedPriorities]);

  const loadWorkItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await workManagementService.getWorkItems();
      setWorkItems(items);
    } catch (err) {
      console.error('Error loading work items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const items = await workManagementService.getWorkItems();
      setWorkItems(items);
    } catch (err) {
      console.error('Error refreshing work items:', err);
    } finally {
      setRefreshing(false);
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

  const handleDatePickerPress = () => {
    if (dateButtonRef.current) {
      dateButtonRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        // Position above the button to avoid overlapping form content
        setDatePickerPosition({
          top: y - 360,
          left: x,
          width: width
        });
        setShowDatePicker(true);
      });
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setCreateFormData({ ...createFormData, dueDate: newDate });
    setShowDatePicker(false);
  };

  const handleCreateWorkItem = async () => {
    if (!createFormData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setCreatingWorkItem(true);

      // Find the category ID from the selected category name
      const selectedCategory = categories.find(cat => cat.name === createFormData.category);
      const categoryId = selectedCategory ? String(selectedCategory.id) : null;

      // Map priority to API format
      const priorityMap: { [key: string]: string } = {
        'Low': 'LOW',
        'Medium': 'MEDIUM',
        'High': 'HIGH',
        'Urgent': 'URGENT',
      };

      // Convert date format from dd/mm/yyyy to yyyy-mm-dd for API
      let apiDueDate = undefined;
      if (createFormData.dueDate) {
        const [day, month, year] = createFormData.dueDate.split('/');
        apiDueDate = `${year}-${month}-${day}`;
      }

      const newWorkItem = await workManagementService.createWorkItem({
        title: createFormData.title,
        description: createFormData.description,
        categoryId: categoryId || undefined,
        statusGroup: 'CAPTURED',
        priority: priorityMap[createFormData.priority] || 'MEDIUM',
        dueDate: apiDueDate,
      });

      console.log('✅ Work item created:', newWorkItem);

      // Reset form and close modal
      setCreateFormData({
        title: '',
        description: '',
        status: 'Captured',
        assignee: 'Unassigned',
        priority: 'Medium',
        category: 'Select Category',
        dueDate: '',
      });
      setSelectedDate('');
      setShowCreateModal(false);

      // Reload work items
      await loadWorkItems();
      Alert.alert('Success', 'Work item created successfully!');
    } catch (err) {
      console.error('Error creating work item:', err);
      Alert.alert('Error', 'Failed to create work item. Please try again.');
    } finally {
      setCreatingWorkItem(false);
    }
  };

  const applyFilters = () => {
    let filtered = workItems;

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(item => selectedStatuses.includes(item.statusGroup));
    }

    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(item => item.priority && selectedPriorities.includes(item.priority));
    }

    setFilteredItems(filtered);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => {
      const updated = prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status];
      return updated;
    });
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev => {
      const updated = prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority];
      return updated;
    });
  };

  const handleOpenCreateModal = () => {
    console.log('🎯 Opening create modal - current state:', showCreateModal);
    setShowCreateModal(true);
    console.log('🎯 Modal state set to true');
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

  const renderWorkItem = ({ item }: { item: WorkItem }) => {
    const statusColor = getStatusColor(item.statusGroup);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={styles.workItemRow}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('WorkItemDetail', { workItemId: item.id })}
      >
        <View style={styles.workItemTitleSection}>
          <Text style={styles.workItemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description && (
            <Text style={styles.workItemDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.workItemMetaRow}>
          <View style={styles.metaItem}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                {item.statusGroup}
              </Text>
            </View>
          </View>

          {item.priority && (
            <View style={styles.metaItem}>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '30' }]}>
                <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
                  {item.priority}
                </Text>
              </View>
            </View>
          )}

          {item.assigneeId && (
            <View style={styles.metaItem}>
              <View style={[styles.assigneeAvatar, { backgroundColor: statusColor }]}>
                {item.assignee?.name ? (
                  <Text style={styles.assigneeInitial}>
                    {item.assignee.name
                      .split(' ')
                      .map(word => word.charAt(0))
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </Text>
                ) : (
                  <MaterialCommunityIcons name="account" size={14} color="#fff" />
                )}
              </View>
            </View>
          )}

          <View style={styles.metaItem}>
            <Text style={styles.dateText}>
              {workManagementService.formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowWorkflowModal(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="menu" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.newItemButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={styles.newItemButtonText}>New Item</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>Work Items</Text>
            <Text style={styles.headerSubtitle}>
              Streamline your productivity with our advanced tracking system.
            </Text>
          </View>
          <View style={styles.filterSection}>
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="filter-variant" size={14} color="#666" />
              <Text style={styles.filterButtonText}>FILTERS</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading work items...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setShowWorkflowModal(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="menu" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.newItemButton} 
              activeOpacity={0.7}
              onPress={handleOpenCreateModal}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={styles.newItemButtonText}>New Item</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleSection}>
            <Text style={styles.headerTitle}>Work Items</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadWorkItems}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowWorkflowModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="menu" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.newItemButton} 
            activeOpacity={0.7}
            onPress={handleOpenCreateModal}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
            <Text style={styles.newItemButtonText}>New Item</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleSection}>
          <Text style={styles.headerTitle}>Work Items</Text>
          <Text style={styles.headerSubtitle}>
            Streamline your productivity with our advanced tracking system.
          </Text>
        </View>
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.7}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialCommunityIcons name="filter-variant" size={14} color="#666" />
            <Text style={styles.filterButtonText}>FILTERS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No work items found</Text>
          <Text style={styles.emptySubText}>
            {selectedStatuses.length > 0 || selectedPriorities.length > 0
              ? 'Try adjusting your filters'
              : 'Create a new work item to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderWorkItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <TouchableOpacity
            style={styles.filterModalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterModalTitle}>
                <MaterialCommunityIcons name="filter-variant" size={16} color="#1a1a1a" />
                {' '}FILTERS
              </Text>

              <View style={styles.filterModalSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <View style={styles.filterOptions}>
                  {statuses.map(status => (
                    <TouchableOpacity
                      key={status}
                      style={
                        selectedStatuses.includes(status)
                          ? styles.filterOptionSelected
                          : styles.filterOption
                      }
                      onPress={() => toggleStatus(status)}
                    >
                      <Text
                        style={
                          selectedStatuses.includes(status)
                            ? styles.filterOptionTextSelected
                            : styles.filterOptionText
                        }
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterModalSection}>
                <Text style={styles.filterSectionTitle}>Priority</Text>
                <View style={styles.filterOptions}>
                  {priorities.map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={
                        selectedPriorities.includes(priority)
                          ? styles.filterOptionSelected
                          : styles.filterOption
                      }
                      onPress={() => togglePriority(priority)}
                    >
                      <Text
                        style={
                          selectedPriorities.includes(priority)
                            ? styles.filterOptionTextSelected
                            : styles.filterOptionText
                        }
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          console.log('🎯 Modal close requested');
          setShowCreateModal(false);
        }}
      >
        <KeyboardAvoidingView 
          style={styles.createModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1}
            onPress={() => {}}
          />
          <View style={styles.createModalContent}>
            <View style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>CREATE WORK ITEM</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.createModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>TITLE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="What needs to be done?"
                  placeholderTextColor="#999"
                  value={createFormData.title}
                  onChangeText={(text) => setCreateFormData({ ...createFormData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.formLabelRow}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={14} color="#999" />
                  <Text style={styles.formLabel}>DESCRIPTION</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Add more context to this item..."
                  placeholderTextColor="#999"
                  value={createFormData.description}
                  onChangeText={(text) => setCreateFormData({ ...createFormData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <View style={styles.formLabelRow}>
                    <MaterialCommunityIcons name="circle" size={14} color="#999" />
                    <Text style={styles.formLabel}>STATUS</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{createFormData.status}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showStatusDropdown && (
                    <View style={styles.dropdownMenu}>
                      {statusOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCreateFormData({ ...createFormData, status: option });
                            setShowStatusDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <View style={styles.formLabelRow}>
                    <MaterialCommunityIcons name="account" size={14} color="#999" />
                    <Text style={styles.formLabel}>ASSIGNEE</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{createFormData.assignee}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showAssigneeDropdown && (
                    <View style={styles.dropdownMenu}>
                      {assigneeOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCreateFormData({ ...createFormData, assignee: option });
                            setShowAssigneeDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <View style={styles.formLabelRow}>
                    <MaterialCommunityIcons name="flag" size={14} color="#999" />
                    <Text style={styles.formLabel}>PRIORITY</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{createFormData.priority}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showPriorityDropdown && (
                    <View style={styles.dropdownMenu}>
                      {priorityOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCreateFormData({ ...createFormData, priority: option });
                            setShowPriorityDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <View style={styles.formLabelRow}>
                    <MaterialCommunityIcons name="tag" size={14} color="#999" />
                    <Text style={styles.formLabel}>CATEGORY</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <Text style={styles.dropdownButtonText}>{createFormData.category}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                  {showCategoryDropdown && (
                    <View style={styles.dropdownMenu}>
                      {categoryOptions.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setCreateFormData({ ...createFormData, category: option });
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.formLabelRow}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#999" />
                  <Text style={styles.formLabel}>DUE DATE (OPTIONAL)</Text>
                </View>
                <TouchableOpacity
                  ref={dateButtonRef}
                  style={styles.dropdownButton}
                  onPress={handleDatePickerPress}
                >
                  <Text style={styles.dropdownButtonText}>
                    {createFormData.dueDate || 'dd/mm/yyyy'}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.createModalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, creatingWorkItem && { opacity: 0.6 }]}
                onPress={handleCreateWorkItem}
                disabled={creatingWorkItem}
              >
                <Text style={styles.createButtonText}>
                  {creatingWorkItem ? 'CREATING...' : 'CREATE ITEM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Workflow Modal Overlay */}
      <Modal
        visible={showWorkflowModal && !isModalClosing}
        transparent
        animationType="fade"
        onRequestClose={() => {
          console.log('📱 Modal onRequestClose triggered');
          setShowWorkflowModal(false);
        }}
        presentationStyle="overFullScreen"
        hardwareAccelerated={true}
      >
        <View 
          style={{ 
            flex: 1, 
            flexDirection: 'row', 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: (showWorkflowModal && !isModalClosing) ? 'auto' : 'none'
          }}
        >
          {/* Workflow Sidebar */}
          <View 
            style={{ 
              flex: 0, 
              width: Dimensions.get('window').width * 0.75,
              pointerEvents: 'auto'
            }}
          >
            <WorkFlowScreen 
              onClose={() => {
                console.log('🔙 WorkFlowScreen onClose called');
                setShowWorkflowModal(false);
              }}
              organizationName={organizationName}
              onNavigate={(screenName: string, params?: any) => {
                console.log(`🎯 onNavigate callback triggered for ${screenName}`, {
                  platform: Platform.OS,
                  params,
                  currentModalState: showWorkflowModal
                });
                
                // Mark modal as closing
                setIsModalClosing(true);
                
                // Close modal first
                setShowWorkflowModal(false);
                
                // Longer delay for iOS to ensure modal animation completes and gesture handlers reset
                const delay = Platform.OS === 'ios' ? 350 : 150;
                setTimeout(() => {
                  console.log(`✅ Executing navigation to ${screenName} after ${delay}ms`);
                  try {
                    navigation.navigate(screenName as any, params);
                  } catch (error) {
                    console.error(`❌ Navigation error: ${error}`);
                  } finally {
                    setIsModalClosing(false);
                  }
                }, delay);
              }}
            />
          </View>

          {/* Overlay on right side - clickable to close */}
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              backgroundColor: 'transparent',
              pointerEvents: 'auto'
            }}
            activeOpacity={1}
            onPress={() => {
              console.log('❌ Overlay pressed - closing modal');
              setShowWorkflowModal(false);
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WorkItemsScreen;
