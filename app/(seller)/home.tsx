import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { storeService } from '@/services/stores';
import { orderService } from '@/services/orders';
import { Store, Order } from '@/types';

export default function SellerHomeScreen() {
  const { profile } = useAuthStore();
  const [store, setStore] = useState<Store | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const myStore = await storeService.getMyStore(profile.id);
      setStore(myStore);
      if (myStore) {
        const orders = await orderService.getSellerOrders(myStore.id);
        setRecentOrders(orders.slice(0, 5));
      }
      setLoading(false);
    })();
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 80 }} color="#2ECC71" />
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noStoreContainer}>
          <Text style={{ fontSize: 50 }}>🌱</Text>
          <Text style={styles.noStoreTitle}>가게를 등록해주세요</Text>
          <Text style={styles.noStoreDesc}>꽃시장에 가게를 등록하고{'\n'}구매자들에게 꽃을 판매해보세요.</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(seller)/store')}
          >
            <Text style={styles.createButtonText}>가게 등록하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pendingCount = recentOrders.filter((o) => o.status === 'pending').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.storeName}>{store.name}</Text>
          <Text style={styles.greeting}>{profile?.name}님, 안녕하세요 👋</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recentOrders.length}</Text>
            <Text style={styles.statLabel}>전체 주문</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#FFA500' }]}>
            <Text style={[styles.statNumber, { color: '#FFA500' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>신규 주문</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 주문</Text>
            <TouchableOpacity onPress={() => router.push('/(seller)/orders')}>
              <Text style={styles.seeAll}>전체 보기</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.length === 0 ? (
            <Text style={styles.emptyText}>아직 주문이 없습니다.</Text>
          ) : (
            recentOrders.map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <View>
                  <Text style={styles.orderBuyer}>{order.buyer?.name}</Text>
                  <Text style={styles.orderMeta}>{order.total_price.toLocaleString()}원 · {order.order_type === 'wholesale' ? '도매' : '소매'}</Text>
                </View>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { padding: 20, backgroundColor: '#fff' },
  storeName: { fontSize: 24, fontWeight: 'bold' },
  greeting: { color: '#888', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, padding: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2ECC71',
  },
  statNumber: { fontSize: 28, fontWeight: 'bold', color: '#2ECC71' },
  statLabel: { color: '#888', marginTop: 4 },
  section: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontWeight: '600', fontSize: 16 },
  seeAll: { color: '#2ECC71' },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  orderBuyer: { fontWeight: '500' },
  orderMeta: { color: '#888', fontSize: 13, marginTop: 2 },
  orderStatus: { color: '#2ECC71', fontWeight: '600' },
  emptyText: { color: '#aaa', textAlign: 'center', paddingVertical: 16 },
  noStoreContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  noStoreTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  noStoreDesc: { color: '#888', textAlign: 'center', lineHeight: 22 },
  createButton: { backgroundColor: '#2ECC71', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  createButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
