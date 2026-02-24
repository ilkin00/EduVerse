import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NotesScreen from '../screens/notes/NotesScreen';
import ProNoteEditor from '../screens/notes/ProNoteEditor';

const Stack = createStackNavigator();

export default function NotesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesList" component={NotesScreen} />
      <Stack.Screen name="NoteEditor" component={ProNoteEditor} />
    </Stack.Navigator>
  );
}
