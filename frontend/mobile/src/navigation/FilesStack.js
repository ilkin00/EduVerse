import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FilesScreen from '../screens/files/FilesScreen';

const Stack = createStackNavigator();

export default function FilesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FilesList" component={FilesScreen} />
    </Stack.Navigator>
  );
}
