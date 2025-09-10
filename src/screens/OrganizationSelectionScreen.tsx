import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveOrgId } from '../utils/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import OrganizationService from '../services/organizationService';
import { Company } from '../types/api';
import { getProxyAuthToken } from '../utils/auth';
import { CONFIG } from '../config';
import { organizationStyles as styles } from '../styles/OrganizationSelectionScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'OrganizationSelection'>;

const OrganizationSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [organizations, setOrganizations] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      

      // Call service which returns Company[] directly
      const organizationList = await OrganizationService.getOrganizations();
      
      // Update UI state
      setOrganizations(organizationList);
      
      console.log(' Organizations loaded successfully:', organizationList.length);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load organizations';
      console.error(' [UI] Organization loading error:', errorMessage);
      setError(errorMessage);
      
      // Just log errors - no session expiration handling
      console.error(' [UI] API call failed:', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrganization = async (company: Company): Promise<void> => {
    if (!company?.id) {
      console.error('Invalid company data:', company);
      Alert.alert('Error', 'Invalid organization data');
      return;
    }

    try {
      setLoading(true);
      
      console.log(' Switching to organization:', company.name);
      console.log(' Organization ID:', company.id);
      
      // Step 1: Call switch-org API using servicew1    
      await OrganizationService.switchOrganization(company.id.toString());
      
      // Step 2: Save selected organization
      await saveOrgId(company.id.toString());
      
      // Add a small delay to ensure API call completes
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navigate to Dashboard using reset method
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Dashboard',
            params: {
              companyId: company.id.toString(),
              companyName: company.name || company.company_uname || 'Unknown Organization',
              organizationId: company.id.toString()
            }
          }
        ]
      });
      
    } catch (error: any) {
      console.error(' Error selecting organization:', error);
      Alert.alert('Error', 'Failed to select organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout when user taps Retry on error state
  const handleRetryLogout = async (): Promise<void> => {
    try {
      const { logout } = require('../utils/auth');
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e) {
      console.error(' Error during logout from retry:', e);                                                                                                            
    }
  };

  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={CONFIG.APP.ORGANIZATION_COLORS.arrowColor} />
          <Text style={styles.loadingText}>Loading organizations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#1a1a1a" 
        translucent={false} 
      />
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to {CONFIG.APP.APP_NAME}</Text>
        <Text style={styles.subtitle}>Select your organization to continue</Text>
      </View>
      
      {loading && organizations.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={CONFIG.APP.ORGANIZATION_COLORS.arrowColor} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetryLogout}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <FlatList
            data={organizations}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.orgItem}
                onPress={() => handleSelectOrganization(item)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <View style={styles.orgDetails}>
                  <Text style={styles.orgName} numberOfLines={2}>
                    {OrganizationService.getDisplayName(item)}
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.centerContent}>
                <Text style={styles.emptyText}>No organizations available</Text>
              </View>
            }
          />
        </View>
      )}
      
    </View>
  );
};

export default OrganizationSelectionScreen;