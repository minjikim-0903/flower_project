import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth';
import { UserRole } from '@/types';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    try {
      await authService.signUp(email, password, name, role, phone);
      setCompleted(true);
    } catch (error: any) {
      Alert.alert('가입 실패', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 28, marginBottom: 12 }}>🌸</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>회원가입 완료!</Text>
        <Text style={{ color: '#666', marginBottom: 40 }}>로그인 후 꽃시장을 이용하세요.</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#FF6B9D', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' }}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>로그인하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>회원가입</Text>

      <Text style={styles.label}>회원 유형</Text>
      <View style={styles.roleContainer}>
        {(['buyer', 'seller'] as UserRole[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.roleButtonActive]}
            onPress={() => setRole(r)}
          >
            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
              {r === 'buyer' ? '🛒 구매자' : '🌺 판매자'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>이름</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="이름 입력" />

      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="이메일 입력"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호 입력 (6자 이상)"
        secureTextEntry
      />

      <Text style={styles.label}>전화번호</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="010-0000-0000"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? '처리 중...' : '회원가입'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.backButton}>
        <Text style={styles.backText}>이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  label: { fontSize: 14, color: '#666', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: { borderColor: '#FF6B9D', backgroundColor: '#FFF0F5' },
  roleText: { fontSize: 15, color: '#666' },
  roleTextActive: { color: '#FF6B9D', fontWeight: '600' },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { alignItems: 'center', marginTop: 16 },
  backText: { color: '#FF6B9D' },
});
