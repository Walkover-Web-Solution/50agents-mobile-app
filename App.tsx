// App.tsx

import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import OrganizationSelectionScreen from './src/screens/OrganizationSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ChatScreen from './src/screens/ChatScreen';
import WorkFlowScreen from './src/screens/WorkManagement/WorkFlowScreen';
import WorkItemsScreen from './src/screens/WorkManagement/WorkItemsScreen';
import WorkItemDetailScreen from './src/screens/WorkManagement/WorkItemDetailScreen';
import ManageCategoriesScreen from './src/screens/WorkManagement/ManageCategoriesScreen';
import ManageViewsScreen from './src/screens/WorkManagement/ManageViewsScreen';
import ManageTagsScreen from './src/screens/WorkManagement/ManageTagsScreen';
import CategoryItemsScreen from './src/screens/WorkManagement/CategoryItemsScreen';
import InProgressTasksScreen from './src/screens/WorkManagement/InProgressTasksScreen';
import AutomationsScreen from './src/screens/WorkManagement/AutomationsScreen';
import APIKeysScreen from './src/screens/WorkManagement/APIKeysScreen';
import WebhooksScreen from './src/screens/WorkManagement/WebhooksScreen';
import { RootStackParamList } from './src/types/navigation';
import { getToken } from './src/utils/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');

  useEffect(() => {
    checkTokenAndSetInitialRoute();
    // Preload AntDesign icon font to avoid any '?' fallback on first render
    AntDesign.loadFont().catch(() => {});
  }, []);

  const checkTokenAndSetInitialRoute = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Token exists, skip login and go to organization selection
        setInitialRoute('OrganizationSelection');
      } else {
        // No token, start with login
        setInitialRoute('Login');
      }
    } catch (error) {
      // Error getting token, start with login
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#1a1a1a' 
      }}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={{ 
          color: '#fff', 
          marginTop: 10, 
          fontSize: 16 
        }}>
          Loading...
        </Text>
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
        <Stack.Screen 
          name="WorkFlow" 
          component={WorkFlowScreen}
          options={{
            gestureEnabled: true,
            presentation: 'card',
            animation: 'slide_from_left',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="WorkItems" 
          component={WorkItemsScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="WorkItemDetail" 
          component={WorkItemDetailScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ManageCategories" 
          component={ManageCategoriesScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ManageViews" 
          component={ManageViewsScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="ManageTags" 
          component={ManageTagsScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="CategoryItems" 
          component={CategoryItemsScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="FilteredWorkItems" 
          component={InProgressTasksScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="Automations" 
          component={AutomationsScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="APIKeys" 
          component={APIKeysScreen}
          options={{
            gestureEnabled: true,
            presentation: 'modal',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen 
          name="Webhooks" 
          component={WebhooksScreen}
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