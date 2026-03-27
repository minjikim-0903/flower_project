import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
      <View className="flex-1 justify-center items-center p-6">
        <Text style={{ fontSize: 28, marginBottom: 12 }}>🌸</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>회원가입 완료!</Text>
        <Text style={{ color: '#666', marginBottom: 40 }}>로그인 후 꽃시장을 이용하세요.</Text>
        <TouchableOpacity
          className="bg-primary rounded-xl p-4 w-full items-center"
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text className="text-white text-base font-semibold">로그인하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 32 }}>회원가입</Text>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#666' }}>회원 유형</Text>
      <View className="flex-row gap-3">
        {(['buyer', 'seller'] as UserRole[]).map((r) => (
          <TouchableOpacity
            key={r}
            className="flex-1 items-center rounded-xl border"
            style={[
              { padding: 14, borderColor: role === r ? '#FF6B9D' : '#ddd', backgroundColor: role === r ? '#FFF0F5' : '#fff' },
            ]}
            onPress={() => setRole(r)}
          >
            <Text style={[{ fontSize: 15, color: role === r ? '#FF6B9D' : '#666' }, role === r && { fontWeight: '600' }]}>
              {r === 'buyer' ? '🛒 구매자' : '🌺 판매자'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#666' }}>이름</Text>
      <TextInput
        className="border rounded-xl text-base"
        style={{ borderColor: '#ddd', padding: 14 }}
        value={name}
        onChangeText={setName}
        placeholder="이름 입력"
      />

      <Text className="text-sm mb-1 mt-3" style={{ color: '#666' }}>이메일</Text>
      <TextInput
        className="border rounded-xl text-base"
        style={{ borderColor: '#ddd', padding: 14 }}
        value={email}
        onChangeText={setEmail}
        placeholder="이메일 입력"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text className="text-sm mb-1 mt-3" style={{ color: '#666' }}>비밀번호</Text>
      <TextInput
        className="border rounded-xl text-base"
        style={{ borderColor: '#ddd', padding: 14 }}
        value={password}
        onChangeText={setPassword}
        placeholder="비밀번호 입력 (6자 이상)"
        secureTextEntry
      />

      <Text className="text-sm mb-1 mt-3" style={{ color: '#666' }}>전화번호</Text>
      <TextInput
        className="border rounded-xl text-base"
        style={{ borderColor: '#ddd', padding: 14 }}
        value={phone}
        onChangeText={setPhone}
        placeholder="010-0000-0000"
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        className="bg-primary rounded-xl p-4 items-center mt-8"
        style={loading ? { opacity: 0.6 } : undefined}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text className="text-white text-base font-semibold">{loading ? '처리 중...' : '회원가입'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} className="items-center mt-4">
        <Text className="text-primary">이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
