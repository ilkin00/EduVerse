import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '../../context/FriendsContext';
import { useLanguage } from '../../context/LanguageContext';

export default function FriendRequestsScreen({ navigation }) {
  const { t } = useLanguage();
  const { friendRequests, acceptRequest, rejectRequest, loadFriendRequests } = useFriends();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    console.log('📬 FriendRequestsScreen açıldı, istekler:', friendRequests);
  }, [friendRequests]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriendRequests();
    setRefreshing(false);
  };

  const handleAccept = (request) => {
    Alert.alert(
      'Arkadaşlık İsteği',
      `${request.user.full_name || request.user.username} arkadaşlık isteğini kabul etmek istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kabul Et',
          onPress: async () => {
            const result = await acceptRequest(request.id);
            if (result.success) {
              Alert.alert('Başarılı', 'Arkadaşlık isteği kabul edildi');
            }
          },
        },
      ]
    );
  };

  const handleReject = (requestId) => {
    Alert.alert(
      'İsteği Reddet',
      'Arkadaşlık isteğini reddetmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            const result = await rejectRequest(requestId);
            if (result.success) {
              Alert.alert('Başarılı', 'İstek reddedildi');
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user.full_name?.charAt(0) || item.user.username.charAt(0)}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{item.user.full_name || item.user.username}</Text>
          <Text style={styles.username}>@{item.user.username}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item)}
        >
          <Ionicons name="checkmark" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
        >
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Arkadaşlık İstekleri</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      <FlatList
        data={friendRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Bekleyen istek yok</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Text style={styles.refreshButtonText}>Yenile</Text>
            </TouchableOpacity>
          </View>
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
  list: {
    padding: 15,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 15,
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
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#6366F1',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
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
  refreshButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
