import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

export default function PrivateChatScreen({ route, navigation }) {
  const { user } = route.params;
  const { user: currentUser } = useAuth();
  const { messages, sendMessage, loadMessages } = useChat();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  const chatMessages = messages[user.id] || [];

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    setLoading(true);
    await loadMessages(user.id);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    await sendMessage(user.id, messageText);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender_id === currentUser?.id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <View style={styles.otherAvatar}>
            <Text style={styles.avatarText}>
              {user.full_name?.charAt(0) || user.username.charAt(0)}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {formatTime(item.created_at)}
            </Text>
            {isMyMessage && (
              <Ionicons
                name={item.is_read ? "checkmark-done" : "checkmark"}
                size={16}
                color={item.is_read ? "#4CAF50" : "#8E8E93"}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {user.full_name?.charAt(0) || user.username.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{user.full_name || user.username}</Text>
            <Text style={styles.headerStatus}>Çevrimiçi</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="call-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#8E8E93" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Mesaj yaz..."
          placeholderTextColor="#8E8E93"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#FFF' : '#8E8E93'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  headerStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  otherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageBubble: {
    borderRadius: 18,
    padding: 12,
    maxWidth: '100%',
  },
  myBubble: {
    backgroundColor: '#6366F1',
  },
  otherBubble: {
    backgroundColor: '#2A2A3E',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#FFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A3E',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 8,
    color: '#FFF',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2A2A3E',
  },
});
