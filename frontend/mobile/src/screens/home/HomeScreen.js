import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const quickActions = [
    { id: 1, title: 'Yeni Not', icon: 'create-outline', color: '#6366F1', screen: 'Notes' },
    { id: 2, title: 'AI Soru', icon: 'flash-outline', color: '#8B5CF6', screen: 'AI' },
    { id: 3, title: 'Oda Kur', icon: 'videocam-outline', color: '#EC4899', screen: 'Rooms' },
  ];

  const continuingCourses = [
    { id: 1, title: 'Lineer Cebir', subtitle: 'Matris İşlemleri', progress: 0.65, color: '#6366F1' },
    { id: 2, title: 'Fizik II', subtitle: 'Elektromanyetizma', progress: 0.4, color: '#8B5CF6' },
    { id: 3, title: 'Organik Kimya', subtitle: 'Alkanlar', progress: 0.8, color: '#EC4899' },
  ];

  const schedule = [
    { id: 1, time: '09:00', title: 'Lineer Cebir Çalışması', duration: '45 dk', active: true },
    { id: 2, time: '14:00', title: 'Fizik Quiz Hazırlığı', duration: '60 dk', active: false },
    { id: 3, time: '16:30', title: 'Grup Çalışması', duration: '90 dk', active: false },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Günaydın,</Text>
          <Text style={styles.userName}>{user?.fullName || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <Text style={styles.searchText}>Notlarınızda arayın...</Text>
        <View style={styles.micButton}>
          <Ionicons name="mic" size={20} color="#6366F1" />
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
        <View style={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity 
              key={action.id} 
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Continue Studying */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Çalışmaya Devam Et</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Tümü</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {continuingCourses.map(course => (
            <TouchableOpacity key={course.id} style={styles.courseCard}>
              <View style={[styles.courseIcon, { backgroundColor: `${course.color}20` }]}>
                <Ionicons name="calculator-outline" size={24} color={course.color} />
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseSubtitle}>{course.subtitle}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${course.progress * 100}%`, backgroundColor: course.color }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(course.progress * 100)}% tamamlandı</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bugünün Programı</Text>
        {schedule.map(item => (
          <TouchableOpacity key={item.id} style={[styles.scheduleItem, item.active && styles.activeSchedule]}>
            <View style={[styles.scheduleTime, item.active && styles.activeScheduleTime]}>
              <Text style={[styles.scheduleTimeText, item.active && styles.activeScheduleTimeText]}>
                {item.time}
              </Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleDuration}>{item.duration}</Text>
            </View>
            {item.active && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* AI Assistant */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>AI Asistanlar</Text>
        <TouchableOpacity 
          style={styles.aiCard}
          onPress={() => navigation.navigate('AI')}
        >
          <View>
            <View style={styles.aiIcon}>
              <Ionicons name="flash" size={24} color="#fff" />
            </View>
            <Text style={styles.aiTitle}>Matematik Çözücü</Text>
            <Text style={styles.aiDescription}>Fotoğraf çek, anında çözüm al</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
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
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
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
  section: {
    marginTop: 30,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  },
  actionTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  courseCard: {
    width: 160,
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  courseIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  courseSubtitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    color: '#888',
    fontSize: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeSchedule: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderColor: '#6366F1',
  },
  scheduleTime: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  activeScheduleTime: {
    backgroundColor: '#6366F1',
  },
  scheduleTimeText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeScheduleTimeText: {
    color: '#fff',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    color: '#fff',
    fontWeight: '600',
  },
  scheduleDuration: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    width: 36,
    height: 36,
    backgroundColor: '#6366F1',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
