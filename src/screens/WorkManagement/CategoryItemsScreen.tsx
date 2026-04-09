import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
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
import categoryItemsStyles from '../../styles/WorkManagement/CategoryItemsScreen.styles';
import { workManagementService, WorkItem } from '../../services/workManagementService';

const styles = categoryItemsStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CategoryItems'>;
type CategoryItemsRouteProp = RouteProp<RootStackParamList, 'CategoryItems'>;

const CategoryItemsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<CategoryItemsRouteProp>();

  const { categoryId, categoryName } = route.params;

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const statuses = ['CAPTURED', 'CLARIFYING', 'THINKING', 'DECIDED', 'IN_PROGRESS', 'CLOSED', 'ARCHIVED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    loadWorkItems();
  }, [categoryId]);

  useEffect(() => {
    applyFilters();
  }, [workItems, selectedStatuses, selectedPriorities]);

  const loadWorkItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await workManagementService.getWorkItemsByCategory(categoryId);
      setWorkItems(items);
      console.log(`✅ Loaded ${items.length} work items for category ${categoryId}`);
    } catch (err) {
      console.error('Error loading work items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load work items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkItems();
    setRefreshing(false);
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

  const getPriorityColor = (priority: string | null): string => {
    const colors: { [key: string]: string } = {
      'HIGH': '#ef4444',
      'MEDIUM': '#f59e0b',
      'LOW': '#64748b',
      'URGENT': '#dc2626',
    };
    return priority ? colors[priority] || '#64748b' : '#64748b';
  };

  const getPriorityLabel = (priority: string | null): string => {
    return priority || 'N/A';
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

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderWorkItem = ({ item }: { item: WorkItem }) => (
    <TouchableOpacity
      style={styles.workItemCard}
      onPress={() => navigation.navigate('WorkItemDetail', { workItemId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.workItemHeader}>
        <View style={styles.workItemTitleSection}>
          <Text style={styles.workItemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.workItemDescription} numberOfLines={1}>
            {item.description || 'No description'}
          </Text>
        </View>
      </View>

      <View style={styles.workItemDetails}>
        {/* Status */}
        <View style={styles.detailItem}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.statusGroup) + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={14}
              color={getStatusColor(item.statusGroup)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.statusGroup) },
              ]}
            >
              {item.statusGroup}
            </Text>
          </View>
        </View>

        {/* Priority */}
        <View style={styles.detailItem}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(item.priority) + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name="flag"
              size={14}
              color={getPriorityColor(item.priority)}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(item.priority) },
              ]}
            >
              {getPriorityLabel(item.priority)}
            </Text>
          </View>
        </View>

        {/* Assignee */}
        <View style={styles.detailItem}>
          <View style={styles.assigneeBadge}>
            <MaterialCommunityIcons name="account-circle" size={14} color="#6366f1" />
            <Text style={styles.assigneeText}>
              {item.assignee?.name || 'Unassigned'}
            </Text>
          </View>
        </View>

        {/* Created Date */}
        <View style={styles.detailItem}>
          <View style={styles.dateBadge}>
            <MaterialCommunityIcons name="calendar" size={14} color="#64748b" />
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />
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
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={{ width: 24 }} />
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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <Text style={styles.headerSubtitle}>
            Viewing all work items associated with the {categoryName} category.
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters Section */}
      <TouchableOpacity 
        style={styles.filtersSection}
        onPress={() => setShowFilterModal(true)}
      >
        <MaterialCommunityIcons name="filter-variant" size={18} color="#1a1a1a" />
        <Text style={styles.filtersText}>FILTERS</Text>
      </TouchableOpacity>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No work items</Text>
          <Text style={styles.emptySubText}>
            {selectedStatuses.length > 0 || selectedPriorities.length > 0
              ? 'No work items match your filters'
              : 'No work items found in this category'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderWorkItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
        />
      )}

      {/* Filter Modal */}
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
    </SafeAreaView>
  );
};

export default CategoryItemsScreen;
