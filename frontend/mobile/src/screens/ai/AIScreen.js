import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const aiFeatures = [
  {
    id: 'chat',
    title: 'Sohbet',
    description: 'Genel sohbet',
    icon: 'chatbubbles',
    color: '#6366F1',
    screen: 'AIChat',
  },
  {
    id: 'math',
    title: 'Matematik',
    description: 'Problem çöz',
    icon: 'calculator',
    color: '#8B5CF6',
    screen: 'AIMath',
  },
  {
    id: 'explain',
    title: 'Konu Anlat',
    description: 'Ders açıkla',
    icon: 'school',
    color: '#EC4899',
    screen: 'AIExplain',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Soru üret',
    icon: 'help-circle',
    color: '#10B981',
    screen: 'AIQuiz',
  },
  {
    id: 'summarize',
    title: 'Özetle',
    description: 'Metin özeti',
    icon: 'document-text',
    color: '#F59E0B',
    screen: 'AISummarize',
  },
  {
    id: 'code',
    title: 'Kod',
    description: 'Programlama',
    icon: 'code-slash',
    color: '#3B82F6',
    screen: 'AICode',
  },
];

export default function AIScreen({ navigation }) {
  const renderFeature = (feature) => (
    <TouchableOpacity
      key={feature.id}
      style={[styles.featureCard, { borderColor: `${feature.color}30` }]}
      onPress={() => navigation.navigate(feature.screen)}
    >
      <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
        <Ionicons name={feature.icon} size={32} color={feature.color} />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Asistan</Text>
        <Text style={styles.headerSubtitle}>
          Yapay zeka destekli öğrenme araçları
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        {aiFeatures.map(renderFeature)}
      </View>

      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => navigation.navigate('AIChat')}
      >
        <View style={styles.chatIcon}>
          <Ionicons name="chatbubbles" size={24} color="#6366F1" />
        </View>
        <View style={styles.chatContent}>
          <Text style={styles.chatTitle}>Genel Sohbet</Text>
          <Text style={styles.chatDescription}>
            Merhaba! Ben StudyVerse AI Asistanıyım. Size nasıl yardımcı olabilirim?
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={24} color="#6366F1" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  featureCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#888',
    fontSize: 14,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chatDescription: {
    color: '#888',
    fontSize: 12,
  },
});
