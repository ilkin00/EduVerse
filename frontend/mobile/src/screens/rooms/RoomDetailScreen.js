import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoomDetailScreen({ route, navigation }) {
  const { t } = useLanguage();
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadRoomData();
    connectWebSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const loadRoomData = async () => {
    try {
      const [roomRes, participantsRes] = await Promise.all([
        api.get(`/rooms/${roomId}`),
        api.get(`/rooms/${roomId}/participants`),
      ]);
      
      setRoom(roomRes.data);
      setParticipants(participantsRes.data);
    } catch (error) {
      Alert.alert(t('common.error'), t('rooms.load_error'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const wsUrl = `ws://10.252.82.29:8000/api/v1/rooms/ws/${roomId}?token=${token}`;
      
      const newSocket = io(wsUrl, {
        transports: ['websocket'],
        reconnection: true,
      });

      newSocket.on('connect', () => {
        console.log('WebSocket connected');
      });

      newSocket.on('message', (message) => {
        setMessages(prev => [...prev, message]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      });

      newSocket.on('participant_joined', (data) => {
        setParticipants(prev => [...prev, data.user]);
      });

      newSocket.on('participant_left', (data) => {
        setParticipants(prev => prev.filter(p => p.id !== data.user_id));
      });

      setSocket(newSocket);
    } catch (error) {
      console.log('WebSocket error:', error);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;

    const message = {
      content: inputText,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    socket.emit('message', message);
    setInputText('');
  };

  const leaveRoom = async () => {
    Alert.alert(
      t('rooms.leave'),
      t('rooms.leave_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('rooms.leave'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/rooms/${roomId}/leave`);
              navigation.goBack();
            } catch (error) {
              Alert.alert(t('common.error'), t('rooms.leave_error'));
            }
          },
        },
      ]
    );
  };

  const getRoomColor = (type) => {
    switch (type) {
      case 'public': return '#10B981';
      case 'private': return '#6366F1';
      case 'study': return '#8B5CF6';
      default: return '#6366F1';
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.user_id === 'me';

    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMe && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>
              {item.username?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.otherBubble
        ]}>
          {!isMe && (
            <Text style={styles.messageUsername}>{item.username}</Text>
          )}
          <Text style={styles.messageText}>{item.content}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderParticipant = ({ item }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Text style={styles.participantAvatarText}>
          {item.username?.charAt(0) || '?'}
        </Text>
      </View>
      <Text style={styles.participantName}>{item.username}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const roomColor = room ? getRoomColor(room.room_type) : '#6366F1';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { borderBottomColor: roomColor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={[styles.roomIcon, { backgroundColor: `${roomColor}20` }]}>
            <Ionicons name="videocam" size={20} color={roomColor} />
          </View>
          <View>
            <Text style={styles.roomName}>{room?.name}</Text>
            <Text style={styles.participantCount}>
              {participants.length} {t('rooms.participants')}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={leaveRoom}>
          <Ionicons name="exit-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="videocam" size={20} color={roomColor} />
          <Text style={[styles.featureText, { color: roomColor }]}>{t('rooms.video')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureButton}>
          <Ionicons name="mic" size={20} color={roomColor} />
          <Text style={[styles.featureText, { color: roomColor }]}>{t('rooms.audio')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.featureButton, styles.featureButtonDisabled]}>
          <Ionicons name="easel" size={20} color="#666" />
          <Text style={styles.featureTextDisabled}>{t('rooms.whiteboard')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.featureButton, styles.featureButtonDisabled]}>
          <Ionicons name="people" size={20} color="#666" />
          <Text style={styles.featureTextDisabled}>{t('rooms.participants')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.participantsContainer}>
        <FlatList
          horizontal
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={item => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.participantsList}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('rooms.message_placeholder')}
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={inputText.trim() ? '#fff' : '#666'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  features: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  featureButton: {
    flex: 1,
    alignItems: 'center',
  },
  featureButtonDisabled: {
    opacity: 0.3,
  },
  featureText: {
    fontSize: 12,
    marginTop: 4,
  },
  featureTextDisabled: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  participantsContainer: {
    marginVertical: 16,
  },
  participantsList: {
    paddingHorizontal: 16,
  },
  participantItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  participantAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#6366F1',
  },
  otherBubble: {
    backgroundColor: '#1A1A2E',
  },
  messageUsername: {
    color: '#888',
    fontSize: 10,
    marginBottom: 4,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  messageTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A2E',
  },
  input: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
});
