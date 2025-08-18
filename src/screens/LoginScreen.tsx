import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
} from 'react-native';
import { OTPVerification } from '@msg91comm/react-native-sendotp';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken } from '../utils/auth';
import { RootStackParamList } from '../types/navigation';

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

        
        // Try both JWT and Base64 formats
        const base64Token = btoa(token);
        
        setOtpVerified(true);
        setIsLoading(true);

        // Save the JWT token (axios.ts will handle the proxy auth token)
        await Promise.all([
          saveToken(token), // Save JWT token
          AsyncStorage.setItem('proxyAuthToken', token), // Save JWT token
          AsyncStorage.removeItem('selectedCompany'),
        ]);
        



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
              widgetId="35686b68546b393235393432"
              authToken="342616TRNlAu6191DI664af651P1"
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
