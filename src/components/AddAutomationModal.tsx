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
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AutomationService, Automation } from '../services/workManagementService';
import addAutomationModalStyles from '../styles/WorkManagement/AddAutomationModal.styles';

const styles = addAutomationModalStyles;

interface AddAutomationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (automation: Automation) => void;
}

const AddAutomationModal = ({ visible, onClose, onSuccess }: AddAutomationModalProps) => {
  const [name, setName] = useState('');
  const [conditionLabel, setConditionLabel] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAutomation = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an automation name');
      return;
    }

    if (!conditionLabel.trim()) {
      Alert.alert('Error', 'Please enter a condition');
      return;
    }

    if (!promptTemplate.trim()) {
      Alert.alert('Error', 'Please enter an AI prompt');
      return;
    }

    try {
      setLoading(true);
      console.log('➕ Creating automation:', { name, conditionLabel, promptTemplate });

      const newAutomation = await AutomationService.createAutomation({
        name: name.trim(),
        conditionLabel: conditionLabel.trim(),
        promptTemplate: promptTemplate.trim(),
      });

      console.log('✅ Automation created successfully:', newAutomation);
      Alert.alert('Success', 'Automation created successfully');
      
      // Reset form
      setName('');
      setConditionLabel('');
      setPromptTemplate('');
      
      // Call success callback
      onSuccess(newAutomation);
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating automation:', error);
      Alert.alert('Error', error.message || 'Failed to create automation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setConditionLabel('');
    setPromptTemplate('');
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
            <Text style={styles.title}>Add New Automation</Text>
            <TouchableOpacity onPress={handleCancel} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Automation Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Automation Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Auto-Prioritizer"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* Condition */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>When to Execute (Condition)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. When a work item is created..."
                placeholderTextColor="#ccc"
                value={conditionLabel}
                onChangeText={setConditionLabel}
                multiline={true}
                numberOfLines={4}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>

            {/* AI Prompt */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>What to Execute (AI Prompt)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Analyze the description..."
                placeholderTextColor="#ccc"
                value={promptTemplate}
                onChangeText={setPromptTemplate}
                multiline={true}
                numberOfLines={4}
                editable={!loading}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

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
              onPress={handleCreateAutomation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>Create Automation</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddAutomationModal;
