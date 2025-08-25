import { Company } from './api';

export type RootStackParamList = {
  // No params needed for login
  Login: undefined;
  
  // Organization selection screen
  OrganizationSelection: undefined;
  
  // Dashboard needs company details
  Dashboard: {
    companyId: string;
    companyName?: string;
    organizationId: string;
  };
  
  // Chat screen needs agent details
  Chat: {
    agentId: string;
    agentName: string;
    agentLogo?: string;
    agentColor?: string;
    threadId?: string; // For continuing existing conversations
  };
  
  // Add other screens here as needed
};

// Re-export the Company type for convenience
export type { Company };

// Navigation prop type for screens
export type ScreenNavigationProp<T extends keyof RootStackParamList> = {
  navigation: {
    navigate: (screen: T, params?: RootStackParamList[T]) => void;
    replace: (screen: T, params?: RootStackParamList[T]) => void;
    goBack: () => void;
  };
  route: {
    params: RootStackParamList[T];
  };
};

export interface Organization {
  id: number;
  name: string;
  domain: string;
}

export interface UserData {
  data: Array<{
    c_companies: Organization[];
    // Add other user data fields as needed
  }>;
}
