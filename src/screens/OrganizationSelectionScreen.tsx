import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken, saveOrgId } from '../utils/auth';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Company } from '../types/api';
import api from '../api/axios'; // Use pre-configured axios instance

type Props = NativeStackScreenProps<RootStackParamList, 'OrganizationSelection'>;

interface OrganizationResponse {
  data: Array<{
    c_companies: Company[];
    id: number;
    name: string;
  }>;
  status: string;
}

const OrganizationSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [organizations, setOrganizations] = useState<Company[]>([]); // ✅ Fix: This is the state used by FlatList
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
  

      // Use the pre-configured axios instance which already has the token
      const response = await api.get<OrganizationResponse>('/c/getDetails');
  
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Extract companies from the response
        const companies = response.data.data[0]?.c_companies || [];
        setOrganizations(companies);
  
      } else {
        setError('No organizations found');
      }
    } catch (err) {
  
      setError('Failed to load organizations. Please try again.');
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
      
      // Save selected organization
      await saveOrgId(company.id.toString());
      
      // Add a small delay to ensure state is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to Dashboard using reset method
      try {
    
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
  
      } catch (navError) {
        console.error('Navigation error:', navError);
        Alert.alert('Navigation Error', 'Failed to navigate to Dashboard');
      }
      
  
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Error selecting organization:', {
        error: errorMessage,
        companyId: company.id,
        timestamp: new Date().toISOString()
      });
      
      Alert.alert(
        'Error', 
        `Failed to select organization: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to 50Agents</Text>
        <Text style={styles.subtitle}>Select your organization to continue</Text>
      </View>
      
      {loading && organizations.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading organizations...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchOrganizations}
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
                <View style={styles.orgContent}>
                  <Text style={styles.orgName} numberOfLines={1}>
                    {item.name || item.company_uname || `Company ${item.id}`}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark background like the first screen
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#87CEEB', // Light blue color like "Welcome to 50Agents"
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0', // Gray color for subtitle
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 20,
  },
  orgItem: {
    backgroundColor: '#2a2a2a', // Dark card background
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  orgContent: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF', // White text for organization name
    marginBottom: 4,
  },
  orgEmail: {
    fontSize: 14,
    color: '#B0B0B0', // Gray color for email
  },
  arrowContainer: {
    marginLeft: 16,
  },
  arrow: {
    fontSize: 20,
    color: '#87CEEB', // Light blue arrow
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    color: '#B0B0B0',
    fontSize: 16,
  },
  emptyText: {
    color: '#B0B0B0',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OrganizationSelectionScreen;