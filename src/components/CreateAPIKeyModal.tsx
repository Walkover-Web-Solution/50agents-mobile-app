import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { APIKeyService, APIKey } from '../services/workManagementService';
import createAPIKeyModalStyles from '../styles/WorkManagement/CreateAPIKeyModal.styles';

const styles = createAPIKeyModalStyles;

interface CreateAPIKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (apiKey: APIKey) => void;
}

const CreateAPIKeyModal = ({ visible, onClose, onSuccess }: CreateAPIKeyModalProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAPIKey = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an API key name');
      return;
    }

    try {
      setLoading(true);
      console.log('🔑 Creating API key:', name);

      const newKey = await APIKeyService.createAPIKey(name.trim());

      console.log('✅ API key created successfully:', newKey);
      Alert.alert('Success', 'API key created successfully');
      
      // Reset form
      setName('');
      
      // Call success callback
      onSuccess(newKey);
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating API key:', error);
      Alert.alert('Error', error.message || 'Failed to create API key');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay} />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New Auth Key</Text>
            <TouchableOpacity onPress={handleCancel} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* API Key Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Production API Key"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.createButton, loading && styles.disabledButton]}
              onPress={handleCreateAPIKey}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateAPIKeyModal;
