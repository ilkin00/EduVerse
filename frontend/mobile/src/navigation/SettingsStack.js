import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileSettings from '../screens/settings/ProfileSettings';
import ChangePassword from '../screens/settings/ChangePassword';
import NotificationSettings from '../screens/settings/NotificationSettings';
import PrivacySettings from '../screens/settings/PrivacySettings';
import AppearanceSettings from '../screens/settings/AppearanceSettings';
import StorageSettings from '../screens/settings/StorageSettings';
import AboutScreen from '../screens/settings/AboutScreen';

const Stack = createStackNavigator();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
      <Stack.Screen name="AppearanceSettings" component={AppearanceSettings} />
      <Stack.Screen name="StorageSettings" component={StorageSettings} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
    </Stack.Navigator>
  );
}
