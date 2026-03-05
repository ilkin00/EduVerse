import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useFriends } from '../context/FriendsContext';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import NotesStack from './NotesStack';
import AIStack from './AIStack';
import RoomsStack from './RoomsStack';
import FilesStack from './FilesStack';
import SocialStack from './SocialStack';
import SettingsStack from './SettingsStack';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { t } = useLanguage();
  const { friendRequests } = useFriends();

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
          } else if (route.name === 'Sosyal') {
            iconName = focused ? 'people-circle' : 'people-circle-outline';
            
            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                {friendRequests.length > 0 && (
                  <View style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    backgroundColor: '#FF3B30',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 4,
                  }}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                      {friendRequests.length}
                    </Text>
                  </View>
                )}
              </View>
            );
          } else if (route.name === 'Dosyalar') {
            iconName = focused ? 'images' : 'images-outline';
          } else if (route.name === 'Ayarlar') {
            iconName = focused ? 'settings' : 'settings-outline';
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
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Notlar" component={NotesStack} />
      <Tab.Screen name="AI" component={AIStack} />
      <Tab.Screen name="Odalar" component={RoomsStack} />
      <Tab.Screen name="Sosyal" component={SocialStack} />
      <Tab.Screen name="Dosyalar" component={FilesStack} />
      <Tab.Screen name="Ayarlar" component={SettingsStack} />
    </Tab.Navigator>
  );
}
