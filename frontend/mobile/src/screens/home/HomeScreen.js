import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFriends } from '../../context/FriendsContext';
import { useChat } from '../../context/ChatContext';
import api from '../../services/api';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { friendRequests } = useFriends();
  const { unreadCount } = useChat();
  
  const [recentNotes, setRecentNotes] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalRooms: 0,
    totalFriends: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Son notları getir
      const notesRes = await api.get('/notes/?limit=5');
      setRecentNotes(notesRes.data);
      
      // Aktif odaları getir
      const roomsRes = await api.get('/rooms/?active=true');
      setActiveRooms(roomsRes.data);
      
      // Arkadaşları ve online olanları getir
      const friendsRes = await api.get('/friends/');
      const onlineFriendsList = friendsRes.data.filter(f => f.user.is_online);
      setOnlineFriends(onlineFriendsList);
      
      // İstatistikleri hesapla
      const allNotes = await api.get('/notes/');
      const allFriends = await api.get('/friends/');
      const allRooms = await api.get('/rooms/');
      
      setStats({
        totalNotes: allNotes.data.length,
        totalRooms: allRooms.data.length,
        totalFriends: allFriends.data.length,
      });
      
    } catch (error) {
      console.log('Dashboard yüklenirken hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Hızlı işlemler
  const quickActions = [
    { 
      id: 1, 
      title: t('notes.new_note'), 
      icon: 'create-outline', 
      color: '#6366F1', 
      screen: 'Notes',
      badge: null 
    },
    { 
      id: 2, 
      title: t('ai.chat'), 
      icon: 'flash-outline', 
      color: '#8B5CF6', 
      screen: 'AI',
      badge: null 
    },
    { 
      id: 3, 
      title: t('rooms.create_room'), 
      icon: 'videocam-outline', 
      color: '#EC4899', 
      screen: 'Rooms',
      badge: null 
    },
    { 
      id: 4, 
      title: 'Sosyal', 
      icon: 'people-outline', 
      color: '#10B981', 
      screen: 'Social',
      badge: friendRequests.length > 0 ? friendRequests.length : null
    },
  ];

  // Son eklenen notlar
  const renderRecentNotes = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📝 Son Notlar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notes')}>
          <Text style={styles.seeAll}>Tümü ({stats.totalNotes})</Text>
        </TouchableOpacity>
      </View>

      {recentNotes.length > 0 ? (
        recentNotes.map(note => (
          <TouchableOpacity 
            key={note.id} 
            style={styles.noteItem}
            onPress={() => navigation.navigate('Notes', { screen: 'NoteDetail', params: { noteId: note.id } })}
          >
            <View style={styles.noteIcon}>
              <Ionicons 
                name={note.note_type === 'drawing' ? 'brush' : 'document-text'} 
                size={20} 
                color="#6366F1" 
              />
            </View>
            <View style={styles.noteInfo}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteDate}>
                {new Date(note.created_at).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Henüz not eklenmemiş</Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate('Notes')}
          >
            <Text style={styles.emptyStateButtonText}>Not Ekle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Aktif odalar
  const renderActiveRooms = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🎥 Aktif Odalar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Rooms')}>
          <Text style={styles.seeAll}>Tümü ({stats.totalRooms})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {activeRooms.length > 0 ? (
          activeRooms.map(room => (
            <TouchableOpacity 
              key={room.id} 
              style={styles.roomCard}
              onPress={() => navigation.navigate('Rooms', { screen: 'RoomDetail', params: { roomId: room.id } })}
            >
              <View style={[styles.roomIcon, { backgroundColor: room.room_type === 'public' ? '#6366F1' : '#8B5CF6' }]}>
                <Ionicons name="videocam" size={24} color="#fff" />
              </View>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomParticipants}>
                {room.participant_count || 0} katılımcı
              </Text>
              <View style={styles.roomStatus}>
                <View style={styles.activeDot} />
                <Text style={styles.roomStatusText}>Canlı</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.horizontalEmptyState}>
            <Text style={styles.emptyStateText}>Aktif oda yok</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Rooms')}
            >
              <Text style={styles.emptyStateButtonText}>Oda Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // Online arkadaşlar
  const renderOnlineFriends = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🟢 Online Arkadaşlar</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Social')}>
          <Text style={styles.seeAll}>Tümü ({stats.totalFriends})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {onlineFriends.length > 0 ? (
          onlineFriends.map(friend => (
            <TouchableOpacity 
              key={friend.friendship_id} 
              style={styles.friendCard}
              onPress={() => navigation.navigate('Social', { 
                screen: 'PrivateChat', 
                params: { user: friend.user } 
              })}
            >
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                  {friend.user.full_name?.charAt(0) || friend.user.username.charAt(0)}
                </Text>
                <View style={styles.onlineBadge} />
              </View>
              <Text style={styles.friendName}>
                {friend.user.full_name || friend.user.username}
              </Text>
              <Text style={styles.friendStatus}>Çevrimiçi</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.horizontalEmptyState}>
            <Text style={styles.emptyStateText}>Online arkadaş yok</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => navigation.navigate('Social', { screen: 'SearchUsers' })}
            >
              <Text style={styles.emptyStateButtonText}>Arkadaş Bul</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );

  // İstatistik kartları
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="document-text" size={24} color="#6366F1" />
        <Text style={styles.statNumber}>{stats.totalNotes}</Text>
        <Text style={styles.statLabel}>Not</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="people" size={24} color="#8B5CF6" />
        <Text style={styles.statNumber}>{stats.totalFriends}</Text>
        <Text style={styles.statLabel}>Arkadaş</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="videocam" size={24} color="#EC4899" />
        <Text style={styles.statNumber}>{stats.totalRooms}</Text>
        <Text style={styles.statLabel}>Oda</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('common.welcome')},</Text>
          <Text style={styles.userName}>{user?.full_name || t('common.user')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Social', { screen: 'FriendRequests' })}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {(friendRequests.length > 0 || unreadCount > 0) && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {friendRequests.length + unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profil')}
          >
            <Text style={styles.profileInitial}>
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama Çubuğu */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Notes', { screen: 'Search' })}
      >
        <Ionicons name="search-outline" size={20} color="#666" />
        <Text style={styles.searchText}>{t('notes.search')}</Text>
        <View style={styles.micButton}>
          <Ionicons name="mic" size={20} color="#6366F1" />
        </View>
      </TouchableOpacity>

      {/* İstatistikler */}
      {renderStats()}

      {/* Hızlı İşlemler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Hızlı İşlemler</Text>
        <View style={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
                {action.badge && (
                  <View style={[styles.actionBadge, { backgroundColor: action.color }]}>
                    <Text style={styles.actionBadgeText}>{action.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Aktif Odalar */}
      {renderActiveRooms()}

      {/* Son Notlar */}
      {renderRecentNotes()}

      {/* Online Arkadaşlar */}
      {renderOnlineFriends()}

      {/* AI Asistan */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>🤖 AI Asistan</Text>
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => navigation.navigate('AI')}
        >
          <View>
            <View style={styles.aiIcon}>
              <Ionicons name="flash" size={24} color="#fff" />
            </View>
            <Text style={styles.aiTitle}>{t('home.math_solver')}</Text>
            <Text style={styles.aiDescription}>{t('home.math_solver_desc')}</Text>
          </View>
          <View style={styles.aiArrow}>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  profileButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  searchText: {
    flex: 1,
    color: '#666',
    fontSize: 16,
    marginLeft: 12,
  },
  micButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#6366F1',
    fontSize: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  roomCard: {
    width: 140,
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roomParticipants: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  roomStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  roomStatusText: {
    color: '#4CAF50',
    fontSize: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(99,102,241,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteDate: {
    color: '#888',
    fontSize: 12,
  },
  friendCard: {
    width: 100,
    backgroundColor: '#1A1A2E',
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  friendAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  friendName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  friendStatus: {
    color: '#4CAF50',
    fontSize: 10,
  },
  horizontalEmptyState: {
    width: 200,
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  emptyState: {
    backgroundColor: '#1A1A2E',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyStateText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
  },
  emptyStateButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  aiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    padding: 20,
    borderRadius: 16,
  },
  aiIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  aiArrow: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
