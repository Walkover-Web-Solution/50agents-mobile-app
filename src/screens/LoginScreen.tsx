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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavProp>();

 
  
  const handleLoginSuccess = async (data: any) => {
    // Log raw response for debugging/verification
    console.log('🔍 LOGIN SCREEN TEST - Apple Sign-In Success');
    try {
      console.log('📍 Apple Login Success - Raw Response:', JSON.stringify(data, null, 2));
    } catch {
      console.log('📍 Apple Login Success - Raw Response (non-JSON):', data);
    }

    try {
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

      console.log(' Extracted token present:', !!token);
      console.log(' Extracted email:', email || 'not provided');

      if (!token) {
        // Help debug: show top-level keys when token missing
        const keys = data && typeof data === 'object' ? Object.keys(data) : [];
        const nestedKeys = data?.data && typeof data.data === 'object' ? Object.keys(data.data) : [];
        console.log(' No token in response. Top-level keys:', keys);
        console.log(' data.data keys:', nestedKeys);
        Alert.alert('Login Failed', 'No token received. Please try again.');
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

      console.log(' proxy_auth_token saved. Navigating to OrganizationSelection...');

      // Navigate forward exactly as before
      navigation.reset({
        index: 0,
        routes: [{ name: 'OrganizationSelection' }],
      });
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
