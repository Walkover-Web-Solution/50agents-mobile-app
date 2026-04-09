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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FilteredWorkItems'>;
type FilteredWorkItemsRouteProp = RouteProp<RootStackParamList, 'FilteredWorkItems'>;

const FilteredWorkItemsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<FilteredWorkItemsRouteProp>();

  const { filterType, filterValue, filterLabel } = route.params;

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorkItems();
  }, [filterType, filterValue]);

  const loadWorkItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await workManagementService.getWorkItems();
      
      let filtered = items;
      if (filterType === 'status') {
        filtered = items.filter(item => item.statusGroup === filterValue);
      } else if (filterType === 'assignee') {
        if (filterValue === 'me') {
          filtered = items.filter(item => item.assigneeId !== null);
        }
      }
      
      setWorkItems(filtered);
      console.log(`✅ Loaded ${filtered.length} work items for ${filterLabel}`);
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
          <Text style={styles.headerTitle}>{filterLabel}</Text>
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
          <Text style={styles.headerTitle}>{filterLabel}</Text>
          <Text style={styles.headerSubtitle}>
            Showing results for: "{filterLabel}"
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {workItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="inbox-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No work items</Text>
          <Text style={styles.emptySubText}>
            No work items found for {filterLabel}
          </Text>
        </View>
      ) : (
        <FlatList
          data={workItems}
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
    </SafeAreaView>
  );
};

export default FilteredWorkItemsScreen;
