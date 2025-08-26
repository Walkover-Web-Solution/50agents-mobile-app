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
      console.log('🔑 JWT Token (message):', parsedData?.message);
      
      // 🔍 Decode JWT token to see payload
      if (parsedData?.message) {
        try {
          const jwtToken = parsedData.message;
          
          console.log('🔗 FULL JWT TOKEN:');
          console.log(jwtToken);
     
          
          const base64Payload = jwtToken.split('.')[1];
          const decodedPayload = JSON.parse(atob(base64Payload));
          
          console.log('🚀 JWT Token Decoded:');
          console.log('📄 Header:', JSON.parse(atob(jwtToken.split('.')[0])));
          console.log('📝 Payload:', decodedPayload);
          console.log('🔐 Signature:', jwtToken.split('.')[2]);
          
          console.log('🔍 Available Fields in JWT:');
          Object.keys(decodedPayload).forEach(key => {
            console.log(`   - ${key}: ${decodedPayload[key]}`);
          });
          
        } catch (decodeError) {
          console.error('❌ JWT Decode Error:', decodeError);
        }
      }
      
      // Check multiple possible response formats for MSG91 OTP
      let isSuccess = false;
      let token = null;

      // Format 1: data.type === 'success' && data.message (MSG91 common format)
      if (parsedData?.type?.toLowerCase() === 'success' && parsedData?.message) {
        isSuccess = true;
        token = parsedData.message; // Extract only the JWT token
        console.log('✅ Format 1: type=success, message found');
      }
      // Format 2: data.status === 'success' && data.message
      else if (parsedData?.status?.toLowerCase() === 'success' && parsedData?.message) {
        isSuccess = true;
        token = parsedData.message;
        console.log('✅ Format 2: status=success, message found');
      }
      // Format 3: data.status === 'success' && data.token
      else if (parsedData?.status?.toLowerCase() === 'success' && parsedData?.token) {
        isSuccess = true;
        token = parsedData.token;
        console.log('✅ Format 3: status=success, token found');
      }
      // Format 4: data.success === true && data.data?.token
      else if (parsedData?.success === true && parsedData?.data?.token) {
        isSuccess = true;
        token = parsedData.data.token;
        console.log('✅ Format 4: success=true, data.token found');
      }
      // Format 5: Direct token in parsedData (string response)
      else if (typeof parsedData === 'string' && parsedData.length > 50) {
        isSuccess = true;
        token = parsedData;
        console.log('✅ Format 5: Direct token string');
      }
      // Format 6: data.message exists (fallback)
      else if (parsedData?.message && typeof parsedData.message === 'string') {
        isSuccess = true;
        token = parsedData.message;
        console.log('✅ Format 6: Fallback message found');
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
            'Login Failed', 
            'Unable to generate authentication token. Please try again.',
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
