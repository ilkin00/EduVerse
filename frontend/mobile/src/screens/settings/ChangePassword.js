import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ChangePassword({ navigation }) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (formData.new_password.length < 6) {
      Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password,
      });

      Alert.alert(
        'Başarılı',
        'Şifreniz değiştirildi',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Hata',
        error.response?.data?.detail || 'Şifre değiştirilemedi'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Şifre Değiştir</Text>
        <TouchableOpacity onPress={handleChangePassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text style={styles.saveButton}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          {/* Mevcut Şifre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mevcut Şifre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.current_password}
                onChangeText={(text) => setFormData({ ...formData, current_password: text })}
                placeholder="Mevcut şifrenizi girin"
                placeholderTextColor="#666"
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                <Ionicons
                  name={showCurrent ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Yeni Şifre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.new_password}
                onChangeText={(text) => setFormData({ ...formData, new_password: text })}
                placeholder="En az 6 karakter"
                placeholderTextColor="#666"
                secureTextEntry={!showNew}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNew(!showNew)}
              >
                <Ionicons
                  name={showNew ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Yeni Şifre Tekrar */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.confirm_password}
                onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
                placeholder="Yeni şifrenizi tekrar girin"
                placeholderTextColor="#666"
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Şifre Güvenlik İpuçları */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Şifre Güvenlik İpuçları:</Text>
            <View style={styles.tipItem}>
              <Ionicons 
                name={formData.new_password.length >= 6 ? 'checkmark-circle' : 'close-circle'} 
                size={16} 
                color={formData.new_password.length >= 6 ? '#4CAF50' : '#EF4444'} 
              />
              <Text style={styles.tipText}>En az 6 karakter</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons 
                name={/[A-Z]/.test(formData.new_password) ? 'checkmark-circle' : 'close-circle'} 
                size={16} 
                color={/[A-Z]/.test(formData.new_password) ? '#4CAF50' : '#EF4444'} 
              />
              <Text style={styles.tipText}>En az bir büyük harf</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons 
                name={/[0-9]/.test(formData.new_password) ? 'checkmark-circle' : 'close-circle'} 
                size={16} 
                color={/[0-9]/.test(formData.new_password) ? '#4CAF50' : '#EF4444'} 
              />
              <Text style={styles.tipText}>En az bir rakam</Text>
            </View>
          </View>
        </View>
      </View>
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
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  tipsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tipsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    color: '#888',
    fontSize: 14,
  },
});
