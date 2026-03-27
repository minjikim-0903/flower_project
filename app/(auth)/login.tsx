import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/useAuthStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { loadProfile } = useAuthStore();

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('이메일을 입력해주세요.');
      return false;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('비밀번호를 입력해주세요.');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);
    try {
      await authService.signIn(email, password);
      await loadProfile();
      router.replace('/');
    } catch (error: any) {
      // Supabase v2는 보안상 미가입 이메일과 비밀번호 오류를 동일 메시지로 반환.
      // 두 필드 모두에 안내 메시지를 표시해 가입 여부를 확인하도록 유도.
      setEmailError('가입되지 않은 이메일이거나 비밀번호가 올바르지 않습니다.');
      setPasswordError('비밀번호를 다시 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text style={{ fontSize: 40, textAlign: 'center', marginBottom: 8 }}>🌸 꽃시장</Text>
        <Text className="text-base text-center mb-10" style={{ color: '#666' }}>꽃 도소매 플랫폼</Text>

        <View className="mb-3">
          <TextInput
            className={`border rounded-xl text-base${emailError ? ' border-error' : ''}`}
            style={{ borderColor: emailError ? '#FF3B30' : '#ddd', padding: 14 }}
            placeholder="이메일"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) validateEmail(v);
            }}
            onBlur={() => validateEmail(email)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text className="text-error text-xs mt-1 ml-1">{emailError}</Text> : null}
        </View>

        <View className="mb-3">
          <TextInput
            className={`border rounded-xl text-base${passwordError ? ' border-error' : ''}`}
            style={{ borderColor: passwordError ? '#FF3B30' : '#ddd', padding: 14 }}
            placeholder="비밀번호"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (passwordError) validatePassword(v);
            }}
            onBlur={() => validatePassword(password)}
            secureTextEntry
          />
          {passwordError ? <Text className="text-error text-xs mt-1 ml-1">{passwordError}</Text> : null}
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl p-4 items-center mt-2"
          style={loading ? { opacity: 0.6 } : undefined}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold">{loading ? '로그인 중...' : '로그인'}</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text style={{ color: '#666' }}>아직 계정이 없으신가요? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">회원가입</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
