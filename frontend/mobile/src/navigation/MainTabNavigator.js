import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import NotesStack from './NotesStack';
import AIStack from './AIStack';
import RoomsStack from './RoomsStack';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notlar') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Odalar') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Ana Sayfa" 
        component={HomeScreen} 
        options={{ title: t('home.title') || 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="Notlar" 
        component={NotesStack} 
        options={{ title: t('notes.title') || 'Notlar' }}
      />
      <Tab.Screen 
        name="AI" 
        component={AIStack} 
        options={{ title: t('ai.title') || 'AI' }}
      />
      <Tab.Screen 
        name="Odalar" 
        component={RoomsStack} 
        options={{ title: t('rooms.title') || 'Odalar' }}
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfileScreen} 
        options={{ title: t('profile.title') || 'Profil' }}
      />
    </Tab.Navigator>
  );
}
