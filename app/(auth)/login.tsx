import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Flower2 } from 'lucide-react-native';
import { Input, InputField } from '@gluestack-ui/themed';
import { Button, ButtonText, ButtonSpinner } from '@gluestack-ui/themed';
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
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Flower2 size={44} color="#FF6B9D" strokeWidth={1.8} />
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#222222', marginTop: 6 }}>꽃시장</Text>
        </View>
        <Text className="text-base text-center mb-10" style={{ color: '#6a6a6a' }}>꽃 도소매 플랫폼</Text>

        <View className="mb-3">
          <Input
            variant="outline"
            style={{ borderRadius: 12, borderColor: emailError ? '#FF3B30' : '#f0f0f0', backgroundColor: '#fff' }}
          >
            <InputField
              placeholder="이메일"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (emailError) validateEmail(v);
              }}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ padding: 14, fontSize: 15 }}
            />
          </Input>
          {emailError ? <Text className="text-error text-xs mt-1 ml-1">{emailError}</Text> : null}
        </View>

        <View className="mb-3">
          <Input
            variant="outline"
            style={{ borderRadius: 12, borderColor: passwordError ? '#FF3B30' : '#f0f0f0', backgroundColor: '#fff' }}
          >
            <InputField
              placeholder="비밀번호"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) validatePassword(v);
              }}
              onBlur={() => validatePassword(password)}
              secureTextEntry
              style={{ padding: 14, fontSize: 15 }}
            />
          </Input>
          {passwordError ? <Text className="text-error text-xs mt-1 ml-1">{passwordError}</Text> : null}
        </View>

        <Button
          onPress={handleLogin}
          isDisabled={loading}
          style={{ backgroundColor: '#FF6B9D', borderRadius: 12, height: 52, opacity: loading ? 0.6 : 1, marginTop: 8 }}
        >
          {loading && <ButtonSpinner color="white" mr="$2" />}
          <ButtonText style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {loading ? '로그인 중...' : '로그인'}
          </ButtonText>
        </Button>

        <View className="flex-row justify-center mt-6">
          <Text style={{ color: '#6a6a6a' }}>아직 계정이 없으신가요? </Text>
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
