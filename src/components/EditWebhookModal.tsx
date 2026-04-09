import React, { useState, useEffect } from 'react';
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
import { WebhookService, Webhook } from '../services/workManagementService';
import editWebhookModalStyles from '../styles/WorkManagement/EditWebhookModal.styles';

const styles = editWebhookModalStyles;

interface EditWebhookModalProps {
  visible: boolean;
  webhook: Webhook;
  onClose: () => void;
  onSuccess: (webhook: Webhook) => void;
}

const EditWebhookModal = ({ visible, webhook, onClose, onSuccess }: EditWebhookModalProps) => {
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (visible && webhook) {
      setName(webhook.name);
      setWebhookUrl(webhook.webhookUrl);
      setHeaders(WebhookService.stringifyHeaders(webhook.headers));
      setIsActive(webhook.isActive);
      setUrlError('');
    }
  }, [visible, webhook]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a webhook name');
      return false;
    }

    if (!webhookUrl.trim()) {
      Alert.alert('Error', 'Please enter a webhook URL');
      return false;
    }

    if (!WebhookService.isValidWebhookUrl(webhookUrl)) {
      Alert.alert('Error', 'Please enter a valid HTTPS or HTTP URL');
      return false;
    }

    // Validate headers JSON
    try {
      if (headers.trim() && headers.trim() !== '{}') {
        JSON.parse(headers);
      }
    } catch {
      Alert.alert('Error', 'Headers must be valid JSON format');
      return false;
    }

    return true;
  };

  const handleUpdateWebhook = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('🪝 Updating webhook:', webhook.id);

      const parsedHeaders = WebhookService.parseHeaders(headers);
      const updatedWebhook = await WebhookService.updateWebhook(
        webhook.id,
        name.trim(),
        webhookUrl.trim(),
        isActive,
        parsedHeaders
      );

      console.log('✅ Webhook updated successfully:', updatedWebhook);
      Alert.alert('Success', 'Webhook updated successfully');
      
      // Call success callback
      onSuccess(updatedWebhook);
      onClose();
    } catch (error: any) {
      console.error('❌ Error updating webhook:', error);
      Alert.alert('Error', error.message || 'Failed to update webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleUrlChange = (url: string) => {
    setWebhookUrl(url);
    if (url.trim()) {
      if (WebhookService.isValidWebhookUrl(url)) {
        setUrlError('');
      } else {
        setUrlError('Must be a valid HTTPS or HTTP URL');
      }
    } else {
      setUrlError('');
    }
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
            <Text style={styles.title}>Edit Webhook</Text>
            <TouchableOpacity onPress={handleCancel} disabled={loading}>
              <MaterialCommunityIcons name="close" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Webhook Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Production Webhook"
                placeholderTextColor="#ccc"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* Webhook URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Webhook URL *</Text>
              <TextInput
                style={[styles.input, urlError && styles.inputError]}
                placeholder="https://example.com/webhook"
                placeholderTextColor="#ccc"
                value={webhookUrl}
                onChangeText={handleUrlChange}
                editable={!loading}
              />
              {urlError ? (
                <Text style={styles.errorText}>{urlError}</Text>
              ) : (
                <Text style={styles.helperText}>Must be a valid HTTPS URL</Text>
              )}
            </View>

            {/* Headers */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Headers (JSON format)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={'{\n  "Authorization": "Bearer token"\n}'}
                placeholderTextColor="#ccc"
                value={headers}
                onChangeText={setHeaders}
                editable={!loading}
                multiline={true}
                numberOfLines={4}
              />
              <Text style={styles.helperText}>
                Optional: Add custom HTTP headers as JSON
              </Text>
            </View>

            {/* Active Status */}
            <View style={styles.formGroup}>
              <View style={styles.toggleContainer}>
                <View>
                  <Text style={styles.label}>Active Status</Text>
                  <Text style={styles.helperText}>
                    Webhook will receive events
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    isActive && styles.toggleActive
                  ]}
                  onPress={() => setIsActive(!isActive)}
                  disabled={loading}
                >
                  <View style={[
                    styles.toggleThumb,
                    isActive && styles.toggleThumbActive
                  ]} />
                </TouchableOpacity>
              </View>
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
              style={[styles.button, styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdateWebhook}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.updateButtonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditWebhookModal;
