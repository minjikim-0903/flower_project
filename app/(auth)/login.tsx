import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🌸 꽃시장</Text>
        <Text style={styles.subtitle}>꽃 도소매 플랫폼</Text>

        <View style={styles.fieldWrapper}>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
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
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.fieldWrapper}>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="비밀번호"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (passwordError) validatePassword(v);
            }}
            onBlur={() => validatePassword(password)}
            secureTextEntry
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '로그인 중...' : '로그인'}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>아직 계정이 없으신가요? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>회원가입</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  fieldWrapper: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  inputError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#666' },
  link: { color: '#FF6B9D', fontWeight: '600' },
});
