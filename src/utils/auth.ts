import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'proxyAuthToken';
const SELECTED_COMPANY_KEY = 'selectedCompany';

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
