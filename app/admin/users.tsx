import { View, Text, StyleSheet } from 'react-native';

export default function AdminUsers() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>구매자 관리</Text>
      <Text style={styles.subtitle}>추후 구현 예정</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 8 },
});
