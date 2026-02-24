import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AIScreen from '../screens/ai/AIScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import AIMathScreen from '../screens/ai/AIMathScreen';
import AIExplainScreen from '../screens/ai/AIExplainScreen';

const Stack = createStackNavigator();

export default function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AIMain" component={AIScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
      <Stack.Screen name="AIMath" component={AIMathScreen} />
      <Stack.Screen name="AIExplain" component={AIExplainScreen} />
    </Stack.Navigator>
  );
}
