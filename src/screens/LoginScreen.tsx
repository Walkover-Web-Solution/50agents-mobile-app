import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { CONFIG } from '../config';
import { loginStyles as styles } from '../styles/LoginScreen.styles';
import { saveProxyAuthToken, saveUserEmail, saveToken } from '../utils/auth';
import { ShowProxyAuth } from '../react-native-proxy/src';
import organizationService from '../services/organizationService';
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavProp>();

 
  
  const handleLoginSuccess = async (data: any) => {
   
    try {
      // 🔍 DETAILED DEBUGGING: Log complete response structure
      console.log('📱 ===== LOGIN SUCCESS RESPONSE DEBUG =====');
      console.log('📱 Full response data:', JSON.stringify(data, null, 2));
      console.log('📱 Response type:', typeof data);
      console.log('📱 Response keys:', data ? Object.keys(data) : 'null/undefined');
      
      if (data?.data) {
        console.log('📱 data.data keys:', Object.keys(data.data));
        console.log('📱 data.data content:', JSON.stringify(data.data, null, 2));
      }
      
      // Multiple token extraction patterns for Apple Sign-In
      const token: string | undefined = 
        data?.data?.proxy_auth_token || 
        data?.proxy_auth_token ||
        data?.token ||
        data?.data?.token ||
        data?.authToken ||
        data?.data?.authToken;
      
      const email: string | undefined = 
        data?.data?.email || 
        data?.email ||
        data?.user?.email ||
        data?.data?.user?.email;

      console.log('📱 Extracted token present:', !!token);
      console.log('📱 Extracted token length:', token ? token.length : 'no token');
      console.log('📱 Extracted token first 50 chars:', token ? token.substring(0, 50) + '...' : 'no token');
      console.log('📱 Extracted email:', email || 'not provided');

      // Check for any API errors first
      if (data?.data?.error) {
        console.log('📱 ❌ API ERROR:', data.data.error);
        Alert.alert('Login Failed', `Error: ${data.data.error}`);
        return;
      }

      if (!token) {
        // Help debug: show top-level keys when token missing
        const keys = data && typeof data === 'object' ? Object.keys(data) : [];
        const nestedKeys = data?.data && typeof data.data === 'object' ? Object.keys(data.data) : [];
        console.log('📱 ❌ NO TOKEN FOUND IN RESPONSE');
        console.log('📱 Top-level keys:', keys);
        console.log('📱 data.data keys:', nestedKeys);
        
        // Check if there's any error message to show
        const errorMsg = data?.data?.error || data?.error || 'No token received. Please try again.';
        Alert.alert('Login Failed', errorMsg);
        return;
      }

      // Persist session
      await Promise.all([
        saveProxyAuthToken(token),
        // Save compatibility token so App.tsx can skip Login on relaunch
        saveToken(token),
        email ? saveUserEmail(email) : Promise.resolve(false),
        AsyncStorage.removeItem('selectedCompany'),
        AsyncStorage.setItem('referenceId', CONFIG.APP.DEFAULTS.REFERENCE_ID),
      ]);

     // Fetch organizations and auto-navigate
// Fetch organizations and auto-navigate
const organizations = await organizationService.getOrganizations();

if (organizations && organizations.length > 0) {
  const defaultOrg = organizations[0];

  navigation.reset({
    index: 0,
    routes: [{
      name: 'Dashboard',
      params: {
        companyName: defaultOrg.name || defaultOrg.company_uname ,
        companyId: String(defaultOrg.id),
        organizationId: String(defaultOrg.id),
      }
    }]
  });
} else {
  navigation.reset({
    index: 0,
    routes: [{ name: 'OrganizationSelection' }],
  });
}
    } catch (err) {
      console.error(' Proxy login success handling error:', err);
      Alert.alert('Login Failed', 'Could not save session. Please try again.');
    }
  };
                                                                                                                                                                
  const handleLoginFailure = (error: any) => {
    try {
      console.log(' Proxy Login Failure:', JSON.stringify(error, null, 2));
    } catch {
      console.log(' Proxy Login Failure (non-JSON)');
    }
    Alert.alert('Login Failed', 'Authentication was cancelled or failed.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.contentContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.8}
        >
          Welcome to 50Agents
        </Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {/* Google login via proxy package */}
        <View style={styles.buttonContainer}>
          <ShowProxyAuth
            referenceId={CONFIG.APP.DEFAULTS.REFERENCE_ID}
            onLoginSuccess={handleLoginSuccess}
            onLoginFailure={handleLoginFailure}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
