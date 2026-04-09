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
    organizationId: string;
  };
  
  // WorkFlow screen
  WorkFlow: {
    organizationName?: string;
  };
  
  // Work Items screen
  WorkItems: {
    organizationName?: string;
  };

  // Work Item Detail screen
  WorkItemDetail: {
    workItemId: number;
  };

  // Manage Categories screen
  ManageCategories: {
    organizationName?: string;
    openAddModal?: boolean;
  };

  // Manage Views screen
  ManageViews: {
    organizationName?: string;
    openAddModal?: boolean;
  };
  ManageTags: {
    organizationName?: string;
  };

  // Category Items screen
  CategoryItems: {
    categoryId: number;
    categoryName: string;
    organizationName?: string;
  };

  // Filtered Work Items screen
  FilteredWorkItems: {
    filterType: 'status' | 'assignee';
    filterValue: string;
    filterLabel: string;
    organizationName?: string;
  };

  // Automations screen
  Automations: {
    organizationName?: string;
  };

  // API Keys screen
  APIKeys: {
    organizationName?: string;
  };

  // Webhooks screen
  Webhooks: {
    organizationName?: string;
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
