import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SellerCommunityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>커뮤니티</Text>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>커뮤니티 기능이 준비 중입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});
