import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { FriendsProvider } from './src/context/FriendsContext';
import { ChatProvider } from './src/context/ChatContext';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Main Tab Navigator
import MainTabNavigator from './src/navigation/MainTabNavigator';

const Stack = createStackNavigator();

function AppNavigator() {
  const { language } = useLanguage();
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    setKey(Date.now());
  }, [language]);

  return (
    <Stack.Navigator key={key} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FriendsProvider>
          <ChatProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </ChatProvider>
        </FriendsProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
