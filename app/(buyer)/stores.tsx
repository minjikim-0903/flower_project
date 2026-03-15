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
import { storeService } from '@/services/stores';
import { Store } from '@/types';

export default function StoresScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = await storeService.getStores({ search: q || undefined });
      setStores(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>꽃가게 목록</Text>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="가게 이름으로 검색"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load(search)}
          returnKeyType="search"
        />
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#FF6B9D" />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/(buyer)/store/${item.id}`)}
            >
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.placeholder]}>
                  <Text style={{ fontSize: 28 }}>🌸</Text>
                </View>
              )}
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardAddr} numberOfLines={1}>{item.address}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={
            <Text style={styles.empty}>등록된 가게가 없습니다.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
  searchBox: { padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 10, fontSize: 15 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  cardImage: { width: '100%', height: 120 },
  placeholder: { backgroundColor: '#FFF0F5', justifyContent: 'center', alignItems: 'center' },
  cardName: { fontWeight: '600', fontSize: 15, padding: 8, paddingBottom: 2 },
  cardAddr: { color: '#888', fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
});
