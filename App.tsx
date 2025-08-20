// App.tsx

import React, { useState, useEffect } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import OrganizationSelectionScreen from './src/screens/OrganizationSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import { RootStackParamList } from './src/types/navigation';
import { getToken } from './src/utils/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      
      if (token) {
        // Token exists, skip login and go to organization selection
        console.log('✅ Token found, skipping login');
        setInitialRoute('OrganizationSelection');
      } else {
        // No token, start with login
        console.log('❌ No token found, showing login');
        setInitialRoute('Login');
      }
    } catch (error) {
      console.log('⚠️ Error checking token:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
          contentStyle: { backgroundColor: '#ffffff' },
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen 
          name="OrganizationSelection" 
          component={OrganizationSelectionScreen}
          options={{
            gestureEnabled: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            gestureEnabled: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;