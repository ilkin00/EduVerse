import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../../context/FriendsContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SearchUsersScreen({ navigation }) {
  const { t } = useLanguage();
  const { searchUsers, sendFriendRequest } = useFriends(); // searchUsers burada olmalı
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = async (text) => {
    setQuery(text);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (text.length < 2) {
      setResults([]);
      return;
    }

    setSearchTimeout(
      setTimeout(async () => {
        setLoading(true);
        const users = await searchUsers(text); // Burada çağrılıyor
        setResults(users);
        setLoading(false);
      }, 500)
    );
  };

  const handleSendRequest = async (userId, username) => {
    const result = await sendFriendRequest(userId);
    if (result.success) {
      Alert.alert('Başarılı', `${username} kullanıcısına arkadaşlık isteği gönderildi`);
      // Sonuçları güncelle
      setResults(results.map(r => 
        r.user.id === userId ? { ...r, friendship_status: 'pending' } : r
      ));
    } else {
      Alert.alert('Hata', result.error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return { text: 'Arkadaş', color: '#4CAF50' };
      case 'pending':
        return { text: 'İstek Gönderildi', color: '#FFA500' };
      case 'blocked':
        return { text: 'Engelli', color: '#FF3B30' };
      default:
        return null;
    }
  };

  const renderUserItem = ({ item }) => {
    const statusBadge = getStatusBadge(item.friendship_status);
    const isBlocked = item.is_blocked;

    return (
      <View style={styles.userItem}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user.full_name?.charAt(0) || item.user.username.charAt(0)}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.name}>{item.user.full_name || item.user.username}</Text>
            <Text style={styles.username}>@{item.user.username}</Text>
          </View>
        </View>

        {statusBadge && !isBlocked ? (
          <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.badgeText}>{statusBadge.text}</Text>
          </View>
        ) : isBlocked ? (
          <View style={[styles.badge, { backgroundColor: '#FF3B30' }]}>
            <Text style={styles.badgeText}>Engelli</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSendRequest(item.user.id, item.user.username)}
          >
            <Ionicons name="person-add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Kullanıcı Ara</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Arama */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı adı veya isim ara..."
          placeholderTextColor="#8E8E93"
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        {loading && <ActivityIndicator size="small" color="#6366F1" />}
      </View>

      {/* Sonuçlar */}
      <FlatList
        data={results}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.user.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.length > 1 && !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color="#333" />
              <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
            </View>
          ) : null
        }
      />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
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
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#8E8E93',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
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
  },
});
