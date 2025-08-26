import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserEmail, saveProxyAuthToken, getProxyAuthToken } from '../utils/auth';
import { CONFIG } from '../config';

// Function to get auth token using saved email
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const userEmail = await getUserEmail();
    console.log('Retrieved email from storage:', userEmail);
    
    if (!userEmail) {
      console.log('No email found in storage');
      return null;
    }

    const endpoint = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.GET_AUTH_TOKEN}?user_id=${encodeURIComponent(userEmail)}`;
    
    console.log('Making request to:', endpoint);
    console.log('Using email:', userEmail);
    
    const response = await fetch(endpoint, {
      method: 'GET', 
      headers: {
        'authkey': CONFIG.API.AUTH_KEY,
        'Accept': 'application/json'
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      const token = data.token || data.proxy_auth_token || data.data?.token || data.data?.proxy_auth_token;
      
      if (token) {
        await saveProxyAuthToken(token);
        console.log('Proxy auth token generated and saved');
        return token;
      } else {
        console.log('No token found in response data');
      }
    } else {
      const errorText = await response.text();
      console.log('API Error Response:', errorText);
    }
    
    return null;
  } catch (error) {
    console.log('Error generating auth token:', error);
    return null;
  }
};

const api = axios.create({
  baseURL: CONFIG.API.BASE_URL,
  headers: CONFIG.API.HEADERS,
  timeout: CONFIG.API.REQUEST_TIMEOUT,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get dynamic token from storage
    const token = await getProxyAuthToken();
    
    if (!token) {
      console.log('No proxy auth token found in storage');
    } else {
      console.log('Using dynamic token from storage');
      console.log('proxy_auth_token:', token);
    }
    
    config.headers['proxy_auth_token'] = token;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Disabled session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Token expired or invalid');
      
      // DISABLED: No longer clearing auth storage or auto-logout
      // This prevents session expiration logic
      console.log('Session expiration handling disabled');
      
      // Note: Individual screens can handle errors as needed
    }
    return Promise.reject(error);
  }
);

export default api;