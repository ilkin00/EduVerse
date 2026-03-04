import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FriendsScreen from '../screens/social/FriendsScreen';
import FriendRequestsScreen from '../screens/social/FriendRequestsScreen';
import SearchUsersScreen from '../screens/social/SearchUsersScreen';
import PrivateChatScreen from '../screens/social/PrivateChatScreen';

const Stack = createStackNavigator();

export default function SocialStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendsList" component={FriendsScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="SearchUsers" component={SearchUsersScreen} />
      <Stack.Screen name="PrivateChat" component={PrivateChatScreen} />
    </Stack.Navigator>
  );
}
