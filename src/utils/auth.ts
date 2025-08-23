import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'proxyAuthToken';
const SELECTED_COMPANY_KEY = 'selectedCompany';
const USER_EMAIL_KEY = 'userEmail';
const PROXY_AUTH_TOKEN_KEY = 'proxy_auth_token';

export const saveToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return false;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return null;
  }
};

export const clearToken = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return false;
  }
};

export const saveOrgId = async (orgId: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(SELECTED_COMPANY_KEY, orgId);
    return true;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return false;
  }
};

export const saveSelectedCompany = async (company: any): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(SELECTED_COMPANY_KEY, JSON.stringify(company));
    return true;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return false;
  }
};

export const getSelectedCompany = async (): Promise<any | null> => {
  try {
    const company = await AsyncStorage.getItem(SELECTED_COMPANY_KEY);
    return company ? JSON.parse(company) : null;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return null;
  }
};

export const clearSelectedCompany = async () => {
  try {
    await AsyncStorage.removeItem(SELECTED_COMPANY_KEY);
    return true;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return false;
  }
};

// User Email functions
export const saveUserEmail = async (email: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_EMAIL_KEY, email);
    return true;
  } catch (error) {
    return false;
  }
};    

export const getUserEmail = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_EMAIL_KEY);
  } catch (error) {
    return null;
  }
};

// Proxy Auth Token functions
export const saveProxyAuthToken = async (token: string): Promise<boolean> => {
  try {
    console.log('💾 Saving proxy auth token');
    
    await AsyncStorage.setItem(PROXY_AUTH_TOKEN_KEY, token);
    
    console.log('✅ Proxy auth token saved successfully');
    
    return true;
  } catch (error) {
    console.log('❌ Error saving proxy auth token:', error);
    return false;
  }
};

export const getProxyAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(PROXY_AUTH_TOKEN_KEY);
    
    if (token) {
      console.log('✅ Proxy auth token retrieved from storage');
      console.log('🔑 Retrieved Token:', token);
    } else {
      console.log('⚠️ No proxy auth token found in storage');
    }
    
    return token;
  } catch (error) {
    console.log('❌ Error getting proxy auth token:', error);
    return null;
  }
};

// Comprehensive logout function
export const logout = async (): Promise<boolean> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem('proxyAuthToken'),
      AsyncStorage.removeItem(SELECTED_COMPANY_KEY),
      AsyncStorage.removeItem('selectedOrganization'),
      AsyncStorage.removeItem(USER_EMAIL_KEY),
      AsyncStorage.removeItem(PROXY_AUTH_TOKEN_KEY),
    ]);
    return true;
  } catch (error) {
    // Silent fail for iOS simulator issues
    return false;
  }
};

// Check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await getToken();
    return !!token;
  } catch (error) {
    return false;
  }
};
