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
  TextInput,
  Alert,
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
import manageCategoriesStyles from '../../styles/WorkManagement/ManageCategoriesScreen.styles';
import { workManagementService, Category } from '../../services/workManagementService';

const styles = manageCategoriesStyles;

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ManageCategories'>;
type ManageCategoriesRouteProp = RouteProp<RootStackParamList, 'ManageCategories'>;

const ManageCategoriesScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ManageCategoriesRouteProp>();

  const organizationName = route.params?.organizationName || 'Workspace';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryKeyName, setNewCategoryKeyName] = useState('');
  const [newCategoryExternalTool, setNewCategoryExternalTool] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (route.params?.openAddModal) {
      setShowAddModal(true);
    }
  }, [route.params?.openAddModal]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCategories = await workManagementService.getCategories();
      setCategories(fetchedCategories);
      console.log('✅ Categories loaded:', fetchedCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    const keyName = newCategoryKeyName.trim();
    
    if (!name) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    
    if (!keyName) {
      Alert.alert('Error', 'Please enter a key name (unique ID)');
      return;
    }

    try {
      setCreatingCategory(true);
      const newCategory = await workManagementService.createCategory({
        name: name,
        keyName: keyName,
        externalTool: newCategoryExternalTool.trim(),
      });

      console.log('✅ Category created:', newCategory);
      setCategories([...categories, newCategory]);
      setShowAddModal(false);
      setNewCategoryName('');
      setNewCategoryKeyName('');
      setNewCategoryExternalTool('');
      Alert.alert('Success', 'Category created successfully!');
    } catch (err) {
      console.error('Error creating category:', err);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      console.log(`🗑️ Deleting category ${selectedCategory.id}...`);
      await workManagementService.deleteCategory(selectedCategory.id);
      
      console.log('✅ Category deleted from API');
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
      Alert.alert('Success', 'Category deleted successfully!');
    } catch (err) {
      console.error('Error deleting category:', err);
      Alert.alert('Error', 'Failed to delete category. Please try again.');
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
            <MaterialCommunityIcons 
              name="folder-multiple" 
              size={20} 
              color="#8b5cf6" 
            />
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryDescription} numberOfLines={1}>
              {item.customFields?.length || 0} custom fields
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setSelectedCategory(item);
            setShowDeleteConfirm(true);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <View style={styles.categoryFooter}>
        <TouchableOpacity style={styles.manageFieldsButton} activeOpacity={0.7}>
          <MaterialCommunityIcons name="pencil" size={16} color="#6366f1" />
          <Text style={styles.manageFieldsText}>Manage Fields</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading categories...</Text>
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
          <Text style={styles.headerTitle}>Categories</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCategories}>
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
          <Text style={styles.headerTitle}>Categories</Text>
          <Text style={styles.headerSubtitle}>
            Manage work item types and their custom fields to tailor the platform to your workflow.
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyContainer}>             
          <MaterialCommunityIcons name="folder-open-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No categories yet</Text>
          <Text style={styles.emptySubText}>Create your first category to get started</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <TouchableOpacity 
            style={{ flex: 1 }} 
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Bug Report"
                  placeholderTextColor="#999"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Key Name (Unique ID)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. bug_report"
                  placeholderTextColor="#999"
                  value={newCategoryKeyName}
                  onChangeText={setNewCategoryKeyName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>External Tool (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Jira, GitHub"
                  placeholderTextColor="#999"
                  value={newCategoryExternalTool}
                  onChangeText={setNewCategoryExternalTool}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createButton, creatingCategory && { opacity: 0.6 }]}
                onPress={handleAddCategory}
                disabled={creatingCategory}
              >
                <Text style={styles.createButtonText}>
                  {creatingCategory ? 'Creating...' : 'Create Category'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#ef4444" />
            <Text style={styles.confirmTitle}>Delete Category?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.confirmCancel}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmDelete}
                onPress={handleDeleteCategory}
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

export default ManageCategoriesScreen;
