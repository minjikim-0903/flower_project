import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Input, InputField } from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonSpinner } from '@gluestack-ui/themed';
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
        <Text style={{ color: '#6a6a6a', marginBottom: 40 }}>로그인 후 꽃시장을 이용하세요.</Text>
        <Button
          onPress={() => router.replace('/(auth)/login')}
          style={{ backgroundColor: '#FF6B9D', borderRadius: 12, height: 52, width: '100%' }}
        >
          <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            로그인하기
          </ButtonText>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 32 }}>회원가입</Text>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#6a6a6a' }}>회원 유형</Text>
      <View className="flex-row gap-3">
        {(['buyer', 'seller'] as UserRole[]).map((r) => (
          <TouchableOpacity
            key={r}
            className="flex-1 items-center rounded-xl border"
            style={[
              { padding: 14, borderColor: role === r ? '#FF6B9D' : '#f0f0f0', backgroundColor: role === r ? '#FFF0F5' : '#fff' },
            ]}
            onPress={() => setRole(r)}
          >
            <Text style={[{ fontSize: 15, color: role === r ? '#FF6B9D' : '#6a6a6a' }, role === r && { fontWeight: '600' }]}>
              {r === 'buyer' ? '🛒 구매자' : '🌺 판매자'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#6a6a6a' }}>이름</Text>
      <Input
        variant="outline"
        style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
      >
        <InputField
          value={name}
          onChangeText={setName}
          placeholder="이름 입력"
          style={{ padding: 14, fontSize: 15 }}
        />
      </Input>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#6a6a6a' }}>이메일</Text>
      <Input
        variant="outline"
        style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
      >
        <InputField
          value={email}
          onChangeText={setEmail}
          placeholder="이메일 입력"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ padding: 14, fontSize: 15 }}
        />
      </Input>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#6a6a6a' }}>비밀번호</Text>
      <Input
        variant="outline"
        style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
      >
        <InputField
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호 입력 (6자 이상)"
          secureTextEntry
          style={{ padding: 14, fontSize: 15 }}
        />
      </Input>

      <Text className="text-sm mb-1 mt-3" style={{ color: '#6a6a6a' }}>전화번호</Text>
      <Input
        variant="outline"
        style={{ borderRadius: 12, borderColor: '#f0f0f0', backgroundColor: '#fff' }}
      >
        <InputField
          value={phone}
          onChangeText={setPhone}
          placeholder="010-0000-0000"
          keyboardType="phone-pad"
          style={{ padding: 14, fontSize: 15 }}
        />
      </Input>

      <Button
        onPress={handleSignup}
        isDisabled={loading}
        style={{ backgroundColor: '#FF6B9D', borderRadius: 12, height: 52, opacity: loading ? 0.6 : 1, marginTop: 32 }}
      >
        {loading && <ButtonSpinner color="white" mr="$2" />}
        <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          {loading ? '처리 중...' : '회원가입'}
        </ButtonText>
      </Button>

      <TouchableOpacity onPress={() => router.replace('/(auth)/login')} className="items-center mt-4">
        <Text className="text-primary">이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
