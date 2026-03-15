import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';

export default function SellerSettingScreen() {
  const { profile, signOut } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>설정</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.role}>판매자</Text>
      </View>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>전화번호</Text>
          <Text style={styles.infoValue}>{profile?.phone || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>주소</Text>
          <Text style={styles.infoValue}>{profile?.address || '-'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F8EF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: 'bold' },
  role: { color: '#888', marginTop: 4 },
  infoCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { color: '#888' },
  infoValue: { fontWeight: '500' },
  signOutButton: { margin: 16, padding: 16, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#2ECC71' },
  signOutText: { color: '#2ECC71', fontWeight: '600', fontSize: 16 },
});
