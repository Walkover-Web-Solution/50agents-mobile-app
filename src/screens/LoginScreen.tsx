import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { OTPVerification } from '@msg91comm/react-native-sendotp';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken } from '../utils/auth';
import { RootStackParamList } from '../types/navigation';
import { CONFIG } from '../config';
import { loginStyles as styles } from '../styles/LoginScreen.styles';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const navigation = useNavigation<NavProp>();

  const handleOTPCompletion = async (data: any) => {

    
    if (otpVerified) {

      return;
    }

    try {
      // Parse data if it's a string
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = data;
        }
      }
      
      // 🚀 Console the initial JWT response structure
      console.log('🔑 Full OTP Response:', JSON.stringify(parsedData, null, 2));
      
      
     
     
      
      // Check MSG91 OTP response format
      let isSuccess = false;
      let token = null;

      // MSG91 format: {type: "success", message: "jwt_token"}
      if (parsedData?.type?.toLowerCase() === 'success' && parsedData?.message) {
        isSuccess = true;
        token = parsedData.message; // Extract JWT token
        console.log('✅ MSG91 OTP Success: JWT token extracted');
      } else {
        console.log('❌ MSG91 OTP Failed: Invalid response format');
      }

      console.log('🎯 OTP Validation Result:', { isSuccess, tokenExists: !!token });

      if (isSuccess && token) {
        
        console.log('🔑 JWT Token received successfully');
        
        setOtpVerified(true);
        setIsLoading(true);

        // Save JWT token - Email will be automatically extracted by proxy API
        await Promise.all([
          saveToken(token), // Save JWT token
          AsyncStorage.removeItem('selectedCompany'),
          AsyncStorage.setItem('referenceId', CONFIG.APP.DEFAULTS.REFERENCE_ID), // From config
        ]);
        
        console.log('✅ JWT token saved in AsyncStorage');
        
        // Generate proxy auth token (this will automatically save the email from API response)
        const { getAuthToken } = require('../api/axios');
        const proxyToken = await getAuthToken();
        
        if (!proxyToken) {
          console.log('❌ Failed to generate proxy auth token');
          Alert.alert(
            'Registration Required', 
            'Please register first on web before login in app',
            [
              {
                text: 'OK',
                onPress: () => {
                  setOtpVerified(false);
                  setIsLoading(false);
                  setModalVisible(false);
                }
              }
            ]
          );
          return;
        }
        
        console.log('✅ Login successful');
        setModalVisible(false);

        // Reset stack to prevent going back to the login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'OrganizationSelection' }],
        });
      } else {
        console.log('❌ OTP Validation Failed - Response does not match expected formats');
        throw new Error('Invalid OTP response format. Please try again.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to complete OTP verification';
      console.error('❌ OTP Error:', errorMessage, error);
      
      // Reset states but keep modal open for retry
      setOtpVerified(false);
      // DON'T close modal - keep user on OTP screen
      // setModalVisible(false); // Removed this line
      
      // Show user-friendly error message for OTP retry
      Alert.alert(
        'Invalid OTP', 
        'Please enter the correct OTP. Check your messages and try again.',
        [{
          text: 'OK',
          onPress: () => {
            // Keep user on OTP screen for retry
            setOtpVerified(false);
            setIsLoading(false);
          }
        }]
      );
    } finally {
      if (!otpVerified) {
        setIsLoading(false);
      }
    }
  };

  const handleLoginPress = () => {

    setOtpVerified(false); // Reset for new login attempt
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to 50Agents</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      

      <TouchableOpacity
        style={[styles.loginButton, isLoading && styles.disabledButton]}
        onPress={handleLoginPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login with OTP</Text>
        )}
      </TouchableOpacity>

      {isModalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.otpWrapper}>
            <OTPVerification
              onVisible={isModalVisible}
              onCompletion={handleOTPCompletion}
              widgetId={CONFIG.APP.DEFAULTS.WIDGET_ID} // From config
              authToken={CONFIG.APP.DEFAULTS.AUTH_TOKEN} // From config
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default LoginScreen;
