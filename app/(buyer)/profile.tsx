import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

export default function BuyerProfileScreen() {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>내 정보</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.role}>구매자</Text>
      </View>
      <View style={styles.infoCard}>
        <InfoRow label="전화번호" value={profile?.phone || '-'} />
        <InfoRow label="주소" value={profile?.address || '-'} />
      </View>
      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(buyer)/home')}>
        <Text style={styles.homeText}>홈으로</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold' },
  role: { color: '#888', marginTop: 4 },
  infoCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { color: '#888' },
  infoValue: { fontWeight: '500' },
  homeButton: { marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: '#FF6B9D', alignItems: 'center' },
  homeText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  signOutButton: { margin: 16, padding: 16, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#FF6B9D' },
  signOutText: { color: '#FF6B9D', fontWeight: '600', fontSize: 16 },
});
