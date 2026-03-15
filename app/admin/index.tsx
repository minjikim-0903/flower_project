import { View, Text, StyleSheet } from 'react-native';

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>관리자 대시보드</Text>
      <Text style={styles.subtitle}>추후 구현 예정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#6C5CE7' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 8 },
});
