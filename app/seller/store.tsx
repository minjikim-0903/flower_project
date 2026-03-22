import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { Store } from '@/types';

export default function SellerStoreScreen() {
  const { profile } = useAuthStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await storeService.getMyStores(profile.id);
      setStores(data);
    } catch {
      Alert.alert('오류', '가게 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { fetchStores(); }, [fetchStores]));

  const handleToggleActive = async (store: Store) => {
    try {
      const updated = await storeService.updateStore(store.id, {
        is_active: !store.is_active,
      });
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated : s)));
    } catch {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2ECC71" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>내 가게</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/seller/store-form')}
        >
          <Text style={styles.addButtonText}>+ 가게 등록</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/seller/store-form', params: { storeId: item.id } })}
            activeOpacity={0.8}
          >
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={{ fontSize: 28 }}>🏪</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardName}>{item.name}</Text>
                <View style={[styles.badge, item.is_active ? styles.badgeOpen : styles.badgeClose]}>
                  <Text style={[styles.badgeText, { color: item.is_active ? '#2ECC71' : '#E74747' }]}>
                    {item.is_active ? '영업중' : '휴업중'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>
                  최소주문 {item.min_order_amount.toLocaleString()}원
                </Text>
                <TouchableOpacity
                  style={styles.toggleBtn}
                  onPress={() => handleToggleActive(item)}
                >
                  <Text style={styles.toggleBtnText}>
                    {item.is_active ? '휴업 처리' : '영업 재개'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>등록된 가게가 없습니다</Text>
            <Text style={styles.emptyDesc}>가게를 등록하고 판매를 시작해보세요</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/seller/store-form')}
            >
              <Text style={styles.emptyButtonText}>첫 가게 등록하기</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: { width: '100%', height: 140 },
  cardImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { padding: 14, gap: 6 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardName: { fontSize: 17, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeOpen: { backgroundColor: '#2ECC7120' },
  badgeClose: { backgroundColor: '#E7474720' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardAddress: { color: '#888', fontSize: 13 },
  cardDesc: { color: '#666', fontSize: 13, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardMeta: { color: '#aaa', fontSize: 12 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleBtnText: { fontSize: 12, color: '#555' },

  empty: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyDesc: { color: '#aaa', fontSize: 14 },
  emptyButton: {
    marginTop: 8,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
