import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function AIChatScreen({ navigation }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: t('ai.welcome_message'),
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('mistralai/mistral-7b-instruct');
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  const flatListRef = useRef(null);

  const models = [
    { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', free: true },
    { id: 'google/gemini-flash-1.5', name: 'Gemini Flash', free: true },
    { id: 'cognitivecomputations/dolphin-mixtral-8x7b', name: 'Dolphin Mixtral', free: true },
  ];

  const extractResponseText = (data) => {
    if (!data) return t('ai.no_response');
    if (typeof data === 'string') return data;
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    if (typeof data === 'object') {
      if (data.solution) return data.solution;
      if (data.explanation) return data.explanation;
      if (data.response) return data.response;
      if (data.message) return data.message;
      if (data.content) return data.content;
      return JSON.stringify(data, null, 2);
    }
    return t('ai.no_response');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: inputText,
        model: selectedModel,
        temperature: 0.7,
      });

      const aiResponseText = extractResponseText(response.data);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: t('ai.error'),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      {item.sender === 'ai' && (
        <View style={styles.aiIcon}>
          <Ionicons name="flash" size={16} color="#6366F1" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('ai.chat')}</Text>
        <TouchableOpacity onPress={() => setShowModelSelector(!showModelSelector)}>
          <Ionicons name="options-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {showModelSelector && (
        <View style={styles.modelSelector}>
          {models.map(model => (
            <TouchableOpacity
              key={model.id}
              style={[
                styles.modelOption,
                selectedModel === model.id && styles.modelOptionSelected
              ]}
              onPress={() => {
                setSelectedModel(model.id);
                setShowModelSelector(false);
              }}
            >
              <Text style={[
                styles.modelOptionText,
                selectedModel === model.id && styles.modelOptionTextSelected
              ]}>
                {model.name} {model.free && '🆓'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#6366F1" />
          <Text style={styles.typingText}>{t('ai.thinking')}</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('ai.ask')}
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={inputText.trim() && !loading ? '#fff' : '#666'} 
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modelSelector: {
    backgroundColor: '#1A1A2E',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modelOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  modelOptionSelected: {
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  modelOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  modelOptionTextSelected: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6366F1',
  },
  aiBubble: {
    backgroundColor: '#1A1A2E',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  typingText: {
    color: '#888',
    marginLeft: 8,
    fontSize: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
});
