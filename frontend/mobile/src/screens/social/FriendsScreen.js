import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../../context/FriendsContext';
import { useChat } from '../../context/ChatContext';
import { useLanguage } from '../../context/LanguageContext';

export default function FriendsScreen({ navigation }) {
  const { t } = useLanguage();
  const { friends, friendRequests, loading, removeFriend } = useFriends();
  const { setActiveChat, unreadCount } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const handleChatPress = (friend) => {
    setActiveChat(friend.user);
    navigation.navigate('PrivateChat', { user: friend.user });
  };

  const handleRemoveFriend = (friendshipId, friendName) => {
    Alert.alert(
      'Arkadaşlıktan Çıkar',
      `${friendName} arkadaşlıktan çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: () => removeFriend(friendshipId),
        },
      ]
    );
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user.full_name?.charAt(0) || item.user.username.charAt(0)}
          </Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>
          {item.user.full_name || item.user.username}
        </Text>
        <Text style={styles.friendUsername}>@{item.user.username}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => handleChatPress(item)}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#6366F1" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleRemoveFriend(item.friendship_id, item.user.full_name || item.user.username)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredFriends = friends.filter(f => 
    f.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Arkadaşlar</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('FriendRequests')}
          >
            <Ionicons name="person-add-outline" size={24} color="#FFF" />
            {friendRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{friendRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('SearchUsers')}
          >
            <Ionicons name="search-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Arkadaş ara..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Arkadaş Listesi */}
      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredFriends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.friendship_id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#333" />
              <Text style={styles.emptyText}>Henüz arkadaşın yok</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('SearchUsers')}
              >
                <Text style={styles.addButtonText}>Arkadaş Ekle</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    position: 'relative',
    padding: 5,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#FFF',
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineIndicator: {
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A3E',
  },
  moreButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
