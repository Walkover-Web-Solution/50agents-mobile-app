import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserEmail, saveProxyAuthToken, getProxyAuthToken, saveUserEmail } from '../utils/auth';
import { CONFIG } from '../config';

// Function to get proxy auth token using JWT token from AsyncStorage
export const getAuthToken = async (): Promise<string | null> => {
  try {
    // Get JWT token from AsyncStorage (saved with TOKEN_KEY = 'proxyAuthToken')
    const jwtToken = await AsyncStorage.getItem('proxyAuthToken');
    console.log('🔍 Retrieved JWT token from storage for proxy generation');
    console.log('🔑 JWT Token length:', jwtToken ? jwtToken.length : 'null');
    console.log('🔑 JWT Token first 50 chars:', jwtToken ? jwtToken.substring(0, 50) + '...' : 'null');
    
    if (!jwtToken) {
      console.log('No JWT token found in storage');
      return null;
    }

    const endpoint = `https://dev-assistant-api-1091285226236.asia-south1.run.app/utility/get-proxy-token?otpToken=${encodeURIComponent(jwtToken)}`;
    
    console.log('Making proxy token request to:', endpoint);
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Proxy token response data:', JSON.stringify(data, null, 2));
      
      // Extract email and proxy token from response
      const email = data.data?.email;
      const token = data.token || data.proxy_auth_token || data.data?.token || data.data?.proxy_auth_token;
      
      if (token) {
        // Save both proxy token and email from API response
        await saveProxyAuthToken(token);
        email && await saveUserEmail(email);
        
        console.log('✅ Proxy auth token generated and saved successfully');
        return token;
      } else {
        console.log('❌ No proxy token found in response data');
        console.log('🔍 Available keys in response:', Object.keys(data));
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Proxy token API Error Response:', errorText);
    }
    
    return null;
  } catch (error) {
    console.log('❌ Error generating proxy auth token:', error);
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