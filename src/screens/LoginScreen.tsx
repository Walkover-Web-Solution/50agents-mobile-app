import React, { useState } from 'react';
import {
  StyleSheet,
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
import { saveToken, saveUserEmail } from '../utils/auth';
import { RootStackParamList } from '../types/navigation';
import { CONFIG } from '../config';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userEmail, setUserEmail] = useState(CONFIG.APP.DEFAULTS.USER_EMAIL); // From config
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
      

      
      // Check multiple possible response formats
      let isSuccess = false;
      let token = null;

      // Format 1: data.type === 'success' && data.message
      if (parsedData?.type?.toLowerCase() === 'success' && parsedData?.message) {
        isSuccess = true;
        token = parsedData.message; // Extract only the JWT token
      }
      // Format 2: data.status === 'success' && data.token
      else if (parsedData?.status?.toLowerCase() === 'success' && parsedData?.token) {
        isSuccess = true;
        token = parsedData.token;
      }
      // Format 3: data.success === true && data.data?.token
      else if (parsedData?.success === true && parsedData?.data?.token) {
        isSuccess = true;
        token = parsedData.data.token;
      }
      // Format 4: Direct token in parsedData
      else if (typeof parsedData === 'string') {
        isSuccess = true;
        token = parsedData;
      }



      if (isSuccess && token) {

        
        console.log('🎯 JWT Token Found:', token);
        console.log('🔍 Token Length:', token.length);
        console.log('🔍 Token Type:', typeof token);
        console.log('🔍 Complete OTP Response:', JSON.stringify(parsedData, null, 2));
        
        // Decode JWT token to extract email
        let extractedEmail = '';
        
        // Priority 1: Try to extract email from OTP response first
        if (parsedData?.email) {
          extractedEmail = parsedData.email;
          console.log('📧 Email found in OTP response:', extractedEmail);
        } else if (parsedData?.user_email) {
          extractedEmail = parsedData.user_email;
          console.log('📧 User email found in OTP response:', extractedEmail);
        } else if (parsedData?.data?.email) {
          extractedEmail = parsedData.data.email;
          console.log('📧 Email found in OTP response data:', extractedEmail);
        }
        
        // Priority 2: If no email in OTP response, try JWT token
        if (!extractedEmail) {
         try {
           // JWT token format: header.payload.signature
           const tokenParts = token.split('.');
           if (tokenParts.length === 3) {
             // Decode payload (base64)
             const payload = JSON.parse(atob(tokenParts[1]));
             console.log('🔍 JWT Payload:', JSON.stringify(payload, null, 2));
             
             // Extract email from JWT payload
             extractedEmail = payload.email || payload.user_email || payload.sub || '';
             if (extractedEmail) {
               console.log('📧 Email found in JWT token:', extractedEmail);
             }
           }
         } catch (error) {
           console.log('⚠️ Failed to decode JWT token:', error);
         }
         }
         
         // Priority 3: Use the email entered by the user
         if (!extractedEmail && userEmail) {
           extractedEmail = userEmail.trim();
           console.log('📧 Using user input email as fallback:', extractedEmail);
         }
         
         // Priority 4: Hardcoded email fallback for testing
         if (!extractedEmail) {
           extractedEmail = CONFIG.APP.DEFAULTS.USER_EMAIL; // From config
           console.log('📧 Using hardcoded email as final fallback:', extractedEmail);
         }
        
        // Validate email is extracted
        if (!extractedEmail || extractedEmail.trim() === '') {
          Alert.alert('Email Required', 'Unable to extract email from login response. Please try again or contact support.');
          setOtpVerified(false);
          setIsLoading(false);
          setModalVisible(false);
          return;
        }
        
        console.log('📧 Using email:', extractedEmail);
        
        // Check if user is using registered email
        if(extractedEmail !== CONFIG.APP.DEFAULTS.USER_EMAIL){ // From config
          Alert.alert(
            'Registration Required', 
            'Currently only ' + CONFIG.APP.DEFAULTS.USER_EMAIL + ' is supported.\n\nFor other emails, please register first on the 50Agents website.',
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
        
        setOtpVerified(true);
        setIsLoading(true);

        // Save JWT token and email
        await Promise.all([
          saveToken(token), // Save JWT token
          saveUserEmail(extractedEmail), // Save user email
          AsyncStorage.removeItem('selectedCompany'),
          AsyncStorage.setItem('referenceId', CONFIG.APP.DEFAULTS.REFERENCE_ID), // From config
        ]);
        
        console.log('✅ Email saved in AsyncStorage');
        
        // Generate proxy auth token
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
        throw new Error(data?.message || data?.error || 'Invalid OTP response');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to complete OTP verification';
      console.error('OTP Error:', errorMessage, error);
      
      // Reset states
      setOtpVerified(false);
      setModalVisible(false);
      
      // Show user-friendly error message
      Alert.alert(
        'Login Failed', 
        errorMessage,
        [{
          text: 'OK',
          onPress: () => {
            // Reset the form after user acknowledges the error
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  otpWrapper: {
    flex: 1,
    width: '100%',
    margin: 0,
    padding: 0,
    overflow: 'hidden',
  },
});

export default LoginScreen;
