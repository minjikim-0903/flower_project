import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/useAuthStore';
import { orderService } from '@/services/orders';
import { Order, OrderStatus } from '@/types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  preparing: '준비 중',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '취소됨',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#FFA500',
  confirmed: '#4A90E2',
  preparing: '#9B59B6',
  shipped: '#27AE60',
  delivered: '#2ECC71',
  cancelled: '#E74C3C',
};

export default function OrdersScreen() {
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    orderService
      .getBuyerOrders(profile.id)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>주문 내역</Text>
        <ActivityIndicator style={{ marginTop: 40 }} color="#FF6B9D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>주문 내역</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/users/order/${item.id}`)}
          >
            <View style={styles.orderHeader}>
              <View
                style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '20' }]}
              >
                <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                  {STATUS_LABEL[item.status]}
                </Text>
              </View>
              <Text style={styles.orderType}>
                {item.order_type === 'wholesale' ? '도매' : '소매'}
              </Text>
            </View>
            <Text style={styles.storeName}>{item.store?.name}</Text>
            <View style={styles.orderDetails}>
              <Text style={styles.detailText}>
                배송 예정일: {format(new Date(item.delivery_date), 'M월 d일')}
              </Text>
              <Text style={styles.totalPrice}>{item.total_price.toLocaleString()}원</Text>
            </View>
            <Text style={styles.orderDate}>
              주문일: {format(new Date(item.created_at), 'yyyy.MM.dd')}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text style={styles.emptyText}>주문 내역이 없습니다.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  title: { fontSize: 22, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: '600' },
  orderType: { color: '#888', fontSize: 13 },
  storeName: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailText: { color: '#666', fontSize: 14 },
  totalPrice: { fontSize: 16, fontWeight: '700', color: '#FF6B9D' },
  orderDate: { color: '#aaa', fontSize: 12, marginTop: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#aaa', fontSize: 16 },
});
