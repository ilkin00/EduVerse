import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function RoomsScreen({ navigation }) {
  const { t } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [maxParticipants, setMaxParticipants] = useState('10');

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms/');
      setRooms(response.data);
    } catch (error) {
      Alert.alert(t('common.error'), t('rooms.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert(t('common.error'), t('rooms.name_required'));
      return;
    }

    try {
      const response = await api.post('/rooms/', {
        name: roomName,
        description: roomDescription,
        room_type: roomType,
        max_participants: parseInt(maxParticipants) || 10,
      });
      
      setRooms([response.data, ...rooms]);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert(t('common.error'), t('rooms.create_error'));
    }
  };

  const joinRoom = async (roomId) => {
    try {
      await api.post(`/rooms/${roomId}/join`);
      navigation.navigate('RoomDetail', { roomId });
    } catch (error) {
      Alert.alert(t('common.error'), t('rooms.join_error'));
    }
  };

  const resetForm = () => {
    setRoomName('');
    setRoomDescription('');
    setRoomType('public');
    setMaxParticipants('10');
  };

  const getRoomColor = (type) => {
    switch (type) {
      case 'public': return '#10B981';
      case 'private': return '#6366F1';
      case 'study': return '#8B5CF6';
      default: return '#6366F1';
    }
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case 'public': return 'people';
      case 'private': return 'lock-closed';
      case 'study': return 'school';
      default: return 'videocam';
    }
  };

  const renderRoom = ({ item }) => (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => joinRoom(item.id)}
    >
      <View style={[styles.roomIcon, { backgroundColor: `${getRoomColor(item.room_type)}20` }]}>
        <Ionicons name={getRoomIcon(item.room_type)} size={30} color={getRoomColor(item.room_type)} />
      </View>
      
      <View style={styles.roomContent}>
        <Text style={styles.roomName}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.roomDescription} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.roomFooter}>
          <View style={styles.participantInfo}>
            <Ionicons name="people" size={14} color="#888" />
            <Text style={styles.participantText}>
              {item.current_participants}/{item.max_participants}
            </Text>
          </View>
          
          {item.is_active && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>{t('rooms.active')}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.joinButton}>
        <Text style={styles.joinButtonText}>{t('rooms.join')}</Text>
        <Ionicons name="arrow-forward" size={16} color="#6366F1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('rooms.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('rooms.subtitle')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.createCard}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <View>
          <Text style={styles.createCardTitle}>{t('rooms.create_room')}</Text>
          <Text style={styles.createCardSubtitle}>{t('rooms.create_subtitle')}</Text>
        </View>
        <View style={styles.createCardIcon}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('rooms.active_rooms')}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={rooms}
          renderItem={renderRoom}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="videocam-outline" size={64} color="#333" />
              <Text style={styles.emptyText}>{t('rooms.empty')}</Text>
              <Text style={styles.emptySubText}>{t('rooms.empty_subtitle')}</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('rooms.create_room')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, roomType === 'public' && styles.typeButtonActive]}
                onPress={() => setRoomType('public')}
              >
                <Ionicons name="people" size={20} color={roomType === 'public' ? '#6366F1' : '#666'} />
                <Text style={[styles.typeText, roomType === 'public' && styles.typeTextActive]}>
                  {t('rooms.public')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.typeButton, roomType === 'private' && styles.typeButtonActive]}
                onPress={() => setRoomType('private')}
              >
                <Ionicons name="lock-closed" size={20} color={roomType === 'private' ? '#6366F1' : '#666'} />
                <Text style={[styles.typeText, roomType === 'private' && styles.typeTextActive]}>
                  {t('rooms.private')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.typeButton, roomType === 'study' && styles.typeButtonActive]}
                onPress={() => setRoomType('study')}
              >
                <Ionicons name="school" size={20} color={roomType === 'study' ? '#6366F1' : '#666'} />
                <Text style={[styles.typeText, roomType === 'study' && styles.typeTextActive]}>
                  {t('rooms.study')}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={t('rooms.room_name')}
              placeholderTextColor="#666"
              value={roomName}
              onChangeText={setRoomName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('rooms.room_description')}
              placeholderTextColor="#666"
              value={roomDescription}
              onChangeText={setRoomDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.participantInput}>
              <Text style={styles.participantLabel}>{t('rooms.max_participants')}</Text>
              <TextInput
                style={styles.participantField}
                placeholder="10"
                placeholderTextColor="#666"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={createRoom}
            >
              <Text style={styles.createButtonText}>{t('rooms.create_room')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
  },
  createCardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  createCardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  createCardIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roomIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roomContent: {
    flex: 1,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roomDescription: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  participantText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  activeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  joinButtonText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  typeText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  typeTextActive: {
    color: '#6366F1',
  },
  input: {
    backgroundColor: '#0A0A0F',
    borderRadius: 10,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  participantInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  participantLabel: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  participantField: {
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  createButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
