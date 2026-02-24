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

export default function AIMathScreen({ navigation }) {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  // Response'dan metin çıkaran yardımcı fonksiyon
  const extractResponseText = (data) => {
    if (!data) return 'Cevap alınamadı';
    
    if (typeof data === 'string') return data;
    
    // OpenRouter formatı
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
    
    return 'Cevap alınamadı';
  };

  const solveProblem = async () => {
    if (!problem.trim()) return;

    setLoading(true);
    setSolution('');

    try {
      const response = await api.post('/ai/solve-math', {
        problem: problem,
        model: 'mistralai/mistral-7b-instruct',
        temperature: 0.7,
      });

      console.log('Math response:', JSON.stringify(response.data, null, 2));
      
      const result = extractResponseText(response.data);
      setSolution(result);
    } catch (error) {
      console.log('Math error:', error);
      setSolution('Bir hata oluştu. Lütfen tekrar deneyin.');
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
        <Text style={styles.headerTitle}>Matematik Çözücü</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Problem:</Text>
          <TextInput
            style={styles.input}
            value={problem}
            onChangeText={setProblem}
            placeholder="Örnek: 2x + 5 = 15 denklemini çöz"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity 
            style={[styles.solveButton, loading && styles.solveButtonDisabled]}
            onPress={solveProblem}
            disabled={loading || !problem.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="calculator" size={20} color="#fff" />
                <Text style={styles.solveButtonText}>Çöz</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {solution ? (
          <View style={styles.solutionCard}>
            <Text style={styles.solutionLabel}>Çözüm:</Text>
            <Text style={styles.solutionText}>{solution}</Text>
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
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  solveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solveButtonDisabled: {
    backgroundColor: '#333',
  },
  solveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  solutionCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  solutionLabel: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  solutionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
});
