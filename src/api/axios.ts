import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://routes.msg91.com/api',
  timeout: 15000,
  headers: {
    'Accept': '*/*',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
    'Origin': 'https://chat.50agents.com',
    'Referer': 'https://chat.50agents.com/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
    'proxy_auth_token': 'NlBQeitBNGhjT0h0VGd2ODdSQS9SNWF5VVpTM2FCd3lRdHVkcW1aZXVQWDVEcTJPNExobkI3TFFTWWRIbVVLbkhrbjNvZE1FVnFpeHRPdDFmZmxGdDFiV2RJbnpKeW13T2RHQXRQOG5XTGJzREVxMjZTMW85OVRWMGhjeGpsNjZOa0pjRUsvWFlYMndHQjFnekpwUkFGZDBUekpGQ1F6YmcwcFpzK0J1eVRjPQ=='
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Use working token from website network tab
    const workingToken = 'N0J4RWJEcVg3ajE2QWFHWUE1T3E4alVtckYzaFM4OTUvR0t0b0VTNXNQR2dYNCtMWWlyVmJpQ2tCbXBzSFpSR01jRld0VVVDUVg0c3NpVlAvSkdqZUhBZ3RzTitJc3dHekRCYXBLQUpCa0NscXprd2haK3RLSTg4eXVHU2s3aFhtMzlWdGlJWndyYVNoS1pNdWlnWGxpcXpaR0t3a09zdGYzZThId3Rmd1RvPQ==';
    config.headers['proxy_auth_token'] = workingToken;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
      await AsyncStorage.removeItem('proxyAuthToken');
      // You might want to add navigation here to redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
