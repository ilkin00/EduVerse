import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function AIExplainScreen({ navigation }) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('ortaokul');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const levels = ['ilkokul', 'ortaokul', 'lise', 'üniversite'];

  // Response'dan metin çıkaran yardımcı fonksiyon
  const extractResponseText = (data) => {
    if (!data) return 'Cevap alınamadı';
    
    if (typeof data === 'string') return data;
    
    // OpenRouter formatı
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    if (typeof data === 'object') {
      if (data.explanation) return data.explanation;
      if (data.solution) return data.solution;
      if (data.response) return data.response;
      if (data.message) return data.message;
      if (data.content) return data.content;
      return JSON.stringify(data, null, 2);
    }
    
    return 'Cevap alınamadı';
  };

  const getExplanation = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setExplanation('');

    try {
      const response = await api.post('/ai/explain', {
        topic: topic,
        level: level,
        model: 'mistralai/mistral-7b-instruct',
        temperature: 0.7,
      });

      console.log('Explain response:', JSON.stringify(response.data, null, 2));
      
      const result = extractResponseText(response.data);
      setExplanation(result);
    } catch (error) {
      console.log('Explain error:', error);
      setExplanation('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Konu Anlatımı</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Konu:</Text>
          <TextInput
            style={styles.input}
            value={topic}
            onChangeText={setTopic}
            placeholder="Örnek: Fotosentez, Kuantum fiziği, 2. Dünya Savaşı"
            placeholderTextColor="#666"
          />

          <Text style={[styles.label, { marginTop: 20 }]}>Seviye:</Text>
          <View style={styles.levelContainer}>
            {levels.map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.levelButton,
                  level === l && styles.levelButtonActive,
                ]}
                onPress={() => setLevel(l)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    level === l && styles.levelButtonTextActive,
                  ]}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.explainButton, loading && styles.explainButtonDisabled]}
            onPress={getExplanation}
            disabled={loading || !topic.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="school" size={20} color="#fff" />
                <Text style={styles.explainButtonText}>Açıkla</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {explanation ? (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>Açıklama:</Text>
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        ) : null}
      </ScrollView>
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
    backgroundColor: '#1A1A2E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  levelButtonText: {
    color: '#888',
    fontSize: 14,
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  explainButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainButtonDisabled: {
    backgroundColor: '#333',
  },
  explainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  explanationCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  explanationLabel: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  explanationText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});
