import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store } from '@/types';

export default function BuyerHomeScreen() {
  const { profile } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await storeService.getStores({ search: search || undefined });
      setStores(data);
    } catch {
      // 에러 처리
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {profile?.name}님 👋</Text>
        <Text style={styles.subtitle}>오늘도 좋은 꽃을 만나보세요</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="가게 이름으로 검색"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={loadStores}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#FF6B9D" />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.storeCard}
              onPress={() => router.push(`/(buyer)/store/${item.id}`)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.storeImage} />
              ) : (
                <View style={[styles.storeImage, styles.storeImagePlaceholder]}>
                  <Text style={{ fontSize: 32 }}>🌸</Text>
                </View>
              )}
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeAddress} numberOfLines={1}>{item.address}</Text>
                <Text style={styles.storeDesc} numberOfLines={2}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>등록된 가게가 없습니다.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { padding: 20, backgroundColor: '#fff' },
  greeting: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { color: '#888', marginTop: 4 },
  searchContainer: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  storeImage: { width: '100%', height: 160 },
  storeImagePlaceholder: {
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: { padding: 14 },
  storeName: { fontSize: 18, fontWeight: 'bold' },
  storeAddress: { color: '#888', fontSize: 13, marginTop: 4 },
  storeDesc: { color: '#555', fontSize: 14, marginTop: 6 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});
