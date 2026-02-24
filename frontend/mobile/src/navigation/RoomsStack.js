import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoomsScreen from '../screens/rooms/RoomsScreen';
import RoomDetailScreen from '../screens/rooms/RoomDetailScreen';
import VideoCallScreen from '../screens/rooms/VideoCallScreen';

const Stack = createStackNavigator();

export default function RoomsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoomsList" component={RoomsScreen} />
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} />
    </Stack.Navigator>
  );
}
