import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, saveOrgId, logout } from '../utils/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import OrganizationService from '../services/organizationService';
import { Company } from '../types/api';
import { getProxyAuthToken } from '../utils/auth';
import { CONFIG } from '../config';

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
      
      console.log(' Fetching organizations...');

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
      
      // Step 1: Call switch-org API using service
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

  const handleLogout = async (): Promise<void> => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
              
              // Navigate back to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }]
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={CONFIG.APP.ORGANIZATION_COLORS.arrowColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to {CONFIG.APP.APP_NAME}</Text>
        <Text style={styles.subtitle}>Select your organization to continue</Text>
      </View>
      
      {loading && organizations.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={CONFIG.APP.ORGANIZATION_COLORS.arrowColor} />
          <Text style={styles.loadingText}>Loading organizations...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadOrganizations}
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
      
      {/* Logout Button at Bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.backgroundColor, 
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CONFIG.APP.ORGANIZATION_COLORS.titleColor, 
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: CONFIG.APP.ORGANIZATION_COLORS.subtitleColor, 
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  orgItem: {
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.cardBackgroundColor, 
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orgDetails: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    color: CONFIG.APP.ORGANIZATION_COLORS.orgNameColor, 
    marginBottom: 4,
  },
  orgSubtitle: {
    fontSize: 14,
    color: CONFIG.APP.ORGANIZATION_COLORS.orgSubtitleColor, 
  },
  arrowContainer: {
    marginLeft: 16,
  },
  arrow: {
    fontSize: 20,
    color: CONFIG.APP.ORGANIZATION_COLORS.arrowColor, 
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.errorTextColor, 
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    color: CONFIG.APP.ORGANIZATION_COLORS.loadingTextColor, 
    fontSize: 16,
  },
  emptyText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.emptyTextColor, 
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.retryButtonColor, 
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.retryButtonTextColor, 
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: CONFIG.APP.ORGANIZATION_COLORS.logoutButtonColor, 
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: CONFIG.APP.ORGANIZATION_COLORS.logoutButtonTextColor, 
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: 40,
  },
});

export default OrganizationSelectionScreen;