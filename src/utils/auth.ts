import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'proxyAuthToken';
const SELECTED_COMPANY_KEY = 'selectedCompany';

export const saveToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing token:', error);
    return false;
  }
};

export const saveOrgId = async (orgId: string) => {
  try {
    await AsyncStorage.setItem(SELECTED_COMPANY_KEY, orgId);
    return true;
  } catch (error) {
    console.error('Error saving organization ID:', error);
    return false;
  }
};

export const saveSelectedCompany = async (company: any) => {
  try {
    await AsyncStorage.setItem(SELECTED_COMPANY_KEY, JSON.stringify(company));
    return true;
  } catch (error) {
    console.error('Error saving company:', error);
    return false;
  }
};

export const getSelectedCompany = async () => {
  try {
    const company = await AsyncStorage.getItem(SELECTED_COMPANY_KEY);
    return company ? JSON.parse(company) : null;
  } catch (error) {
    console.error('Error getting company:', error);
    return null;
  }
};

export const clearSelectedCompany = async () => {
  try {
    await AsyncStorage.removeItem(SELECTED_COMPANY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing company:', error);
    return false;
  }
};
