import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NotesScreen from '../screens/notes/NotesScreen';
import TextNoteEditor from '../screens/notes/editor/TextNoteEditor';
import DrawingNoteEditor from '../screens/notes/editor/DrawingNoteEditor';
import AudioNoteEditor from '../screens/notes/editor/AudioNoteEditor';

const Stack = createStackNavigator();

export default function NotesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesList" component={NotesScreen} />
      <Stack.Screen name="NoteEditor" component={TextNoteEditor} />
      <Stack.Screen name="DrawingEditor" component={DrawingNoteEditor} />
      <Stack.Screen name="AudioEditor" component={AudioNoteEditor} />
    </Stack.Navigator>
  );
}
