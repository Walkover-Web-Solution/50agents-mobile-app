// App.tsx

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import OrganizationSelectionScreen from './src/screens/OrganizationSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Navigator
        initialRouteName="Login"
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