import api from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProxyAuthToken } from '../utils/auth';
import type { Company } from '../types/api';

// API Response interfaces
export interface OrganizationApiResponse {
  data: Array<{
    c_companies: Company[];
    id: number;
    name: string;
    email: string;
    mobile: string | null;
    created_at: string;
    updated_at: string;
  }>;
  status: string;
  hasError: boolean;
  errors: any[];
  proxy_duration?: number;
}

// Switch Organization API Response interface
export interface SwitchOrgApiResponse {
  status: string;
  message?: string;
  data: {
    _id: string;
    proxyId: string;
    name: string;
    email: string;
    orgAgentMap: Record<string, string>; // orgId -> agentId mapping
    createdAt: string;
    updatedAt: string;
    avatar?: string;
  };
  success: boolean;
}

// Organization Service Class
export class OrganizationService {
  /**
   * Fetch all organizations for the authenticated user
   */
  static async getOrganizations(): Promise<Company[]> {
    try {
      const response = await api.get<OrganizationApiResponse>('/c/getDetails');
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      // Extract organizations from response
      if (response.data.data && response.data.data.length > 0) {
        const organizations = response.data.data[0]?.c_companies || [];
        return organizations;
      } else {
        return [];
      }

    } catch (error: any) {
      console.error('Error fetching organizations:', error.message);
      
      // Re-throw with more context
      throw new Error(
        error.response?.status === 401 
          ? 'Authentication failed. Please login again.'
          : error.message || 'Failed to fetch organizations'
      );
    }
  }

  /**
   * Get organization by ID (future use)
   */
  static async getOrganizationById(id: number): Promise<Company | null> {
    try {
      const organizations = await this.getOrganizations();
      return organizations.find(org => org.id === id) || null;
    } catch (error) {
      console.error('Error fetching organization by ID:', error);
      return null;
    }
  }

  /**
   * Validate organization data
   */
  static validateOrganization(organization: Company): boolean {
    return !!(
      organization &&
      organization.id &&
      (organization.name || organization.company_uname)
    );
  }

  /**
   * Format organization display name
   */
  static getDisplayName(organization: Company): string {
    return organization.name || 
           organization.company_uname || 
           `Company ${organization.id}`;
  }

  /**
   * Switch to a specific organization
   * Calls the switch-org API and saves orgAgentMap data
   */
  static async switchOrganization(orgId: string): Promise<void> {
    try {
      console.log(' [Service] Switching to organization ID:', orgId);
      
      // Get current user data from storage for dynamic API call
      const userProfile = await AsyncStorage.getItem('userProfile');
      const userData = userProfile ? JSON.parse(userProfile) : null;
      
      // Use dynamic user credentials if available, fallback to hardcoded for now
      const userId = userData?.userId || '36jowpr17'; // TEMP fallback
      const companyId = userData?.companyId || '870623'; // TEMP fallback
      
      console.log(' [Service] Using API credentials - Company:', companyId, 'User:', userId);
      
      const response = await api.post(`/proxy/${companyId}/${userId}/user/switch-org`, {
        orgId: orgId
      });

      console.log(' [Service] Switch-org API response status:', response.status);

      if (response.status === 200) {
        const data: SwitchOrgApiResponse = response.data;
        console.log(' [Service] Switch-org API successful:', JSON.stringify(data, null, 2));
        
        // Save important data from response
        if (data?.data?.orgAgentMap) {
          console.log(' [Service] Saving orgAgentMap:', data.data.orgAgentMap);
          await AsyncStorage.setItem('orgAgentMap', JSON.stringify(data.data.orgAgentMap));
          
          // Get agent ID for current organization
          const agentId = data.data.orgAgentMap[orgId];
          if (agentId) {
            console.log(' [Service] Agent ID for org', orgId, ':', agentId);
            await AsyncStorage.setItem('currentAgentId', agentId);
          }
        }
        
        // Save user profile data
        if (data?.data) {
          console.log(' [Service] Saving user profile data');
          await AsyncStorage.setItem('userProfile', JSON.stringify(data.data));
        }
        
      } else {
        const errorText = response.data || response.statusText || 'Unknown error';
        console.log(' [Service] Switch-org API error:', errorText);
        throw new Error(`Switch-org API failed: ${response.status}`);
      }
      
    } catch (error: any) {
      console.error(' [Service] Switch-org API error:', error);
      throw error;
    }
  }
}

// Export default service for easy importing
export default OrganizationService;
